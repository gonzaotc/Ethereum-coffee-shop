//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

// deployed to Goerli at  0x50d4dD484cefE91c6CD25dbe310F800410Cf5174

contract BuyMeACoffe{

    // Event to emit when a Memo is created
    // indexed makes it easier to to search for addresses in the event log.
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    // Memo struct
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    // List of all memos received 

    Memo[] memos;

    // Adress of contract deployer.
    address payable owner;

    // payable allows a function to receive ether
    constructor() {
        owner = payable(msg.sender);
    }

    // function to buy the coffe for the contract owner
    function buyCoffee(string memory _name, string memory _message) public payable {
        require(msg.value > 0, "can't buy coffe with 0 eth");

        // add memo to storage
        memos.push(
            Memo(
                msg.sender,
                block.timestamp,
                _name,
                _message
        ));

        // emit a log event when a new memo is created
        emit NewMemo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        );
    }


/**
    * @dev  send the entire balance stored in this contract to the owner
 */
function withdrawTips() public {
    // this require is executing it's content the send() method, who is returning a bool true/false
    // the send() method will return a false in case that the balance is <= 0, and the call will be reverted. 
    require(owner.send(address(this).balance));
}

/**
    * @dev  retrieve all memos received and stored on the blockchain
 */
function getMemos() public view returns(Memo[] memory){
    return memos;
}

}