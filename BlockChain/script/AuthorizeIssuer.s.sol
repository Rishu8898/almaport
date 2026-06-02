// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {AlumniVerification} from "../src/AlumniVerification.sol";

/**
 * @title AuthorizeIssuer
 * @dev Script to authorize an issuer (admin wallet) for the AlumniVerification contract
 * @notice Run with: forge script script/AuthorizeIssuer.s.sol --rpc-url <RPC_URL> --broadcast
 *
 * Set these environment variables:
 * - CONTRACT_ADDRESS: Deployed contract address
 * - ISSUER_ADDRESS: Address to authorize as issuer
 * - ISSUER_NAME: Institution name for the issuer
 * - PRIVATE_KEY: Owner's private key (must be contract owner)
 */
contract AuthorizeIssuer is Script {
    function run() external {
        // Get configuration from environment variables
        string memory contractAddressStr = vm.envString("CONTRACT_ADDRESS");
        string memory issuerAddressStr = vm.envString("ISSUER_ADDRESS");
        string memory issuerName = vm.envOr("ISSUER_NAME", string("Authorized Institution"));

        // Convert string to address
        address contractAddress = vm.parseAddress(contractAddressStr);
        address issuerAddress = vm.parseAddress(issuerAddressStr);

        // Get owner's private key
        uint256 ownerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Log details before authorization
        console.log("====================================");
        console.log("Authorizing Issuer");
        console.log("====================================");
        console.log("Contract Address:", contractAddress);
        console.log("Issuer Address:", issuerAddress);
        console.log("Issuer Name:", issuerName);
        console.log("Chain ID:", block.chainid);
        console.log("====================================");

        // Get contract instance
        AlumniVerification alumniContract = AlumniVerification(contractAddress);

        // Start broadcasting (sign and send transactions)
        vm.startBroadcast(ownerPrivateKey);

        // Authorize the issuer
        alumniContract.authorizeIssuer(issuerAddress, issuerName);

        // Stop broadcasting
        vm.stopBroadcast();

        console.log("====================================");
        console.log("Issuer Authorized Successfully!");
        console.log("====================================");
        console.log("Authorized Address:", issuerAddress);
        console.log("Institution Name:", issuerName);
        console.log("====================================");
    }
}
