
var GGToken = artifacts.require("GGToken");

contract('TestGGToken' , function() {

  it("should have 1000000000 GGTokens" , async() => {
    let instance = await GGToken.deployed();
    const totalSupply = await instance.totalSupply.call();

    const expected = 1000000000;

    assert.equal(totalSupply, expected);
  });

  it("should make the owner have 1000000000 GGTokens initially.", async()=>{
    let instance = await GGToken.deployed();
    const ownerBalance = await instance.balanceOf.call(0x5A86f0cafD4ef3ba4f0344C138afcC84bd1ED222);
    //make sure the default owner has all of the tokens
    console.log(ownerBalance.toFixed())
    const expected = 1000000000;
    assert.equal(ownerBalance.valueOf(), expected );
  });

  // it("should allow the owner to send tokens wherever they want.", async()=>{
  //   let instance = await GGToken.deployed();
  //   const sendGG = await instance.transfer(0xD99E32D217aBF4bf3da11E58A76a8231EFC2c469, 100000);
  //   const recieverBalance = await instance.balanceOf(0x5A86f0cafD4ef3ba4f0344C138afcC84bd1ED222);
 
  //   const expected = 100000;
  //   assert.equal(ownerBalance, expected );
  // });



})