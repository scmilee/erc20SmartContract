const GGToken = artifacts.require("GGToken");

contract('GGToken basic coverage' , function() {
  const CBT = web3.eth.accounts[0];
  const learner = web3.eth.accounts[1];
  const learnerTwo = web3.eth.accounts[2];
  before(async()=>{
    instance = await GGToken.deployed({from: CBT});
  })
  

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
  const learner = web3.eth.accounts[1];
  const learnerTwo = web3.eth.accounts[2];
  let instance;
  
  beforeEach(async()=>{
    instance = await GGToken.deployed({from: CBT});
  });

  it("should allow CBT to transfer tokens wherever they want", async()=>{ 
    await instance.transfer(learner, 100000, {from: CBT});
    const learnerBalance = await instance.balanceOf(learner);
 
    const expected = 100000;
    assert.equal(learnerBalance.toNumber(), expected );
  });

  it("should allow a learner to transfer tokens back to CBT", async()=>{
    //send the learner account 100000 coins so we can test if they can send them back
    await instance.transfer(learner, 100000, {from: CBT});
    await instance.transfer(CBT, 100000, {from: learner});
    
    const learnerBalance = await instance.balanceOf(learner);
    const CBTBalance = await instance.balanceOf(CBT);

    const expectedLearnerBal = 0;
    assert.equal(learnerBalance.toNumber(), expectedLearnerBal );
    const expected = 1000000000;
    assert.equal(CBTBalance.toNumber(), expected );

  });

  it("should block a learner from transfering tokens to any address except CBT's", async()=>{
    //send the learner account 100000 coins so we can test if they can send them back
    await instance.transfer(learner, 100000, {from: CBT});
    //try block because this function should fail every time
    try {
      await instance.transfer(learnerTwo, 100000, {from: learner})
    } catch(e) {}
    
    const learnerBalance = await instance.balanceOf(learner);
    const learnerTwoBalance = await instance.balanceOf(learnerTwo);

    //balance should stay at 100k due to the previous transfer function failing
    const expectedLearnerBal = 100000;
    assert.equal(learnerBalance.toNumber(), expectedLearnerBal );
    const expected = 0;
    assert.equal(learnerTwoBalance.toNumber(), expected );

  })


  });