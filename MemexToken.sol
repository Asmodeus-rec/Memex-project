// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title Memex - Adaptive supply ERC20 token
/// @notice ERC20 with owner-controlled safe mint/burn adjustable by an off-chain indexer.
/// @dev Owner should be a multisig in production. Max per-operation adjustment is enforced.
contract MemexToken is ERC20, Ownable, Pausable {
    uint256 public maxAdjustmentBps = 500; // 5% = 500 basis points
    event SupplyAdjusted(int256 indexed delta, uint256 newTotalSupply, address indexed executor);

    constructor(string memory name_, string memory symbol_, uint256 initialSupply) ERC20(name_, symbol_) {
        _mint(msg.sender, initialSupply);
    }

    /// @notice Mint tokens (onlyOwner) but limited by maxAdjustmentBps relative to current supply
    function safeMint(address to, uint256 amount) external onlyOwner whenNotPaused {
        require(amount > 0, "Mint: zero");
        require(amount * 10000 <= totalSupply() * maxAdjustmentBps, "Mint: exceeds max adjustment");
        _mint(to, amount);
        emit SupplyAdjusted(int256(amount), totalSupply(), msg.sender);
    }

    /// @notice Burn tokens from owner's balance (onlyOwner) but limited by maxAdjustmentBps relative to current supply
    function safeBurn(uint256 amount) external onlyOwner whenNotPaused {
        require(amount > 0, "Burn: zero");
        require(amount * 10000 <= totalSupply() * maxAdjustmentBps, "Burn: exceeds max adjustment");
        _burn(msg.sender, amount);
        emit SupplyAdjusted(-int256(amount), totalSupply(), msg.sender);
    }

    /// @notice Adjust the max adjustment basis points (onlyOwner)
    function setMaxAdjustmentBps(uint256 bps) external onlyOwner {
        require(bps <= 2000, "Bps too high"); // safety cap 20%
        maxAdjustmentBps = bps;
    }

    function pause() external onlyOwner {
        _pause();
    }
    function unpause() external onlyOwner {
        _unpause();
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
