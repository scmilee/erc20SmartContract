const GGToken = artifacts.require("GGToken");

contract('GGToken basic coverage' , function() {
  const CBT = web3.eth.accounts[0];
  const learner = web3.eth.accounts[1];
  const learnerTwo = web3.eth.accounts[2];
  
  before(async()=>{
    instance = await GGToken.deployed({from: CBT});
  });

  it("should have 1000000000 GGTokens" , async() => {
    const totalSupply = await instance.totalSupply();
    const expected = 1000000000;

    assert.equal(totalSupply, expected);
  });

  it("should have CBT as its owner", async()=>{
    const owner = await instance.owner.call()
    assert.equal(owner, CBT);
  });

  it("should make CBT have 1000000000 GGTokens initially", async()=>{
    const CBTBalance = await instance.balanceOf(CBT);
    //make sure the default CBT has all of the tokens
    const expected = 1000000000;
    assert.equal(CBTBalance.toNumber(), expected );
  });
});

contract('GGToken transfer coverage' , function() {
  const CBT = web3.eth.accounts[0];
  const invalidAddress = '0x0000000000000000000000000000000000000000';
  const learner = web3.eth.accounts[1];
  const learnerTwo = web3.eth.accounts[2];
  let instance, instanceAddress;
  
  beforeEach(async()=>{
    instance = await GGToken.new({from: CBT});
    instanceAddress = instance.address;
    //send the learner account 100000 coins so we can test if they can send them back
    await instance.transfer(learner, 100000, {from: CBT});
  });

  it("should not allow anyone to send tokens to the contracts address or an invalid address", async()=>{ 
    //try to send tokens to both invalid destinations
    try { await instance.transfer(instanceAddress, 100000, {from: CBT}) } catch(e) {}
    try { await instance.transfer(invalidAddress, 100000, {from: CBT}) } catch(e) {}
    const contractBalance = await instance.balanceOf(instanceAddress);
    const invalidBalance = await instance.balanceOf(invalidAddress);
    
    assert.equal(contractBalance.toNumber(), 0 );
    assert.equal(invalidBalance.toNumber(), 0 );
  });

  it("should allow CBT to transfer tokens wherever they want", async()=>{ 
    const learnerBalance = await instance.balanceOf(learner);
    const expected = 100000;
    
    assert.equal(learnerBalance.toNumber(), expected );
  });

  it("should allow a learner to transfer tokens back to CBT", async()=>{
    //send the tokens back to cbt
    await instance.transfer(CBT, 100000, {from: learner});
    const learnerBalance = await instance.balanceOf(learner);
    const CBTBalance = await instance.balanceOf(CBT);

    assert.equal(learnerBalance.toNumber(), 0 );
    assert.equal(CBTBalance.toNumber(), 1000000000 );
  });

  it("should block a learner from transfering tokens to any address except CBT's", async()=>{
    //try block because this function should fail every time
    try { await instance.transfer(learnerTwo, 100000, {from: learner}) } catch(e) {}  
    const learnerBalance = await instance.balanceOf(learner);
    const learnerTwoBalance = await instance.balanceOf(learnerTwo);
    //balance should stay at 100k due to the previous transfer function failing

    assert.equal(learnerBalance.toNumber(), 100000 );
    assert.equal(learnerTwoBalance.toNumber(), 0 );
  })
});

contract('GGToken approve/allowance coverage' , function() {
  
  const CBT = web3.eth.accounts[0];
  const learner = web3.eth.accounts[1];
  const learnerTwo = web3.eth.accounts[2];
  const invalidAddress = '0x0000000000000000000000000000000000000000';
  let instance, instanceAddress;
  
  beforeEach(async()=>{
    instance = await GGToken.new({from: CBT});
    instanceAddress = instance.address;
    //approve the learner account for 100000 coins
    await instance.approve(learner, 100000, {from: CBT});
  });
  it("should not allow anyone to give an allowance of tokens to the contracts address or an invalid address", async()=>{ 
    //try to approve both the invalid destinations then assert that they dont have any approved tokens to spend
    try { await instance.approve(instanceAddress, 100000, {from: CBT}) } catch(e) {}
    try { await instance.approve(invalidAddress, 100000, {from: CBT}) } catch(e) {}
    const contractAllowance = await instance.allowance(CBT,instanceAddress);
    const invalidAllowance = await instance.allowance(CBT,invalidAddress);
   
    assert.equal(contractAllowance.toNumber(), 0 );
    assert.equal(invalidAllowance.toNumber(), 0 );
  });

  it("should allow CBT to give an allowance of tokens to whomever they want", async()=>{ 
    const learnerAllowance = await instance.allowance(CBT,learner);
    const expected = 100000;
    
    assert.equal(learnerAllowance.toNumber(), expected );
  });

  it("should allow a learner to give an allowance of tokens to CBT", async()=>{
    //transfer the approved coins to the learner then give cbt approval to do the same from the learner
    await instance.transferFrom(CBT, learner ,100000, {from: learner});
    await instance.approve(CBT, 100000, {from: learner});
    const learnerAllowance = await instance.allowance(CBT ,learner);
    const CBTAllowance = await instance.allowance(learner ,CBT);

    assert.equal(learnerAllowance.toNumber(), 0 );
    assert.equal(CBTAllowance.toNumber(), 100000 );
  });

  it("should block a learner from transfering tokens to any address except CBT's", async()=>{
    //try block because this function should fail every time
    await instance.transferFrom(CBT, learner ,100000, {from: learner});
    try { await instance.approve(learnerTwo, 100000, {from: learner}) } catch(e) {}
    const learnerBalance = await instance.balanceOf(learner);
    const learnerTwoAllowance = await instance.allowance(learner,learnerTwo);
    //Allowance should stay at 100k due to the previous approve transaction failing

    assert.equal(learnerBalance.toNumber(), 100000 );
    assert.equal(learnerTwoAllowance.toNumber(), 0 );
  });
});

contract('GGToken pausability coverage' , function() {
  
  const CBT = web3.eth.accounts[0];
  const learner = web3.eth.accounts[1];
  let instance;
  
  beforeEach(async()=>{
    instance = await GGToken.new({from: CBT});
    //pause the instance(as the owner)
    await instance.pause({from: CBT});
  });

  it("allows an owner to pause a contract", async()=>{ 
    const paused = await instance.paused.call()
    assert.equal(paused , true );
  });

  it("doesn\'t allow a non-owner to unpause a contract", async()=>{ 
    //try and catch a unpause() call from a learners address
    try {await instance.unpause({from: learner}) } catch(e){};
    const paused = await instance.paused.call()
    assert.equal(paused , true );
  });

  it("should allow CBT to unpause a contract", async()=>{ 
    //try to send tokens to both invalid destinations
    await instance.unpause({from: CBT});
    const paused = await instance.paused.call()
    assert.equal(paused , false );
  });

  it("prevents anyone from calling transfer while paused", async()=>{ 
    try {await instance.transfer(CBT, 100000, {from: learner}) } catch(error){
      assert.equal(typeof error, 'object');
    };
  });

  it("prevents anyone from calling approve while paused", async()=>{ 
    try {await instance.approve(learner, 100000, {from: CBT}) } catch(error){
      assert.equal(typeof error, 'object');
    };
  });

  it("prevents anyone from calling transferFrom while paused", async()=>{ 
    try {await instance.transferFrom(CBT, learner ,100000, {from: learner})} catch(error){
      assert.equal(typeof error, 'object');
    };
  });

  it("allows balances to still be checked", async()=>{ 
    const CBTBalance = await instance.balanceOf(CBT);
    assert.equal(CBTBalance, 1000000000);
  });

  it("allows allowances to still be checked", async()=>{ 
    const learnerAllowance = await instance.allowance(CBT ,learner);
    assert.equal(learnerAllowance, 0);
  });

});