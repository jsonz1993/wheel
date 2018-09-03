//  完全数（Perfect number），又称完美数或完备数，是一些特殊的自然数。 它所有的真因子（即除了自身以外的约数）的和（即因子函数），恰好等于它本身
// 比如 6 = 1 + 2 + 3 是完美数; 8 != 1 + 2 + 4 不是完美数

// 命令式写法
{
  let num = 6;
  function isPerfect() {
    return aliquotSum() === num;
  }

  function isFactor(potential) {
    return num % potential === 0;
  }

  function getFactors() {
    const arr = [];

    arr.push(1); 
    arr.push(num);

    for (let i= 2; i< num; i++) {
      if (isFactor(i)) arr.push(i);
    }

    return arr;
  }


  function aliquotSum() {
    let sum = 0;
    const factors = getFactors(num);
    for (let i= 0; i< factors.length; i++) {
      sum += factors[i];
    }
    sum -= num;
    return sum;
  }

  const result = isPerfect();
  console.log(result);
}

/**
 * 函数式写法
 * 1. 去除外部变量
 * 2. 优化寻找真因子方法
 * 3. 真因子相加优化
 */
{
  const aliquotSum = num=> Array.from(Array(num), (item, i)=> i)
    .filter(item=> num % item === 0)
    .reduce((cur, next)=> cur += next);
  
  function isPerfect(num) {
    return aliquotSum(num) === num;
  }
    
  const result = isPerfect(6);
  console.log(result);
}