import gen from 'general-number';
import crypto from 'crypto';

const { GN, generalise } = gen;

const BN128_GROUP_ORDER = "21888242871839275222246405745257275088548364400416034343698204186575808495617";

/**
 *  Simple routine to create a cryptographically sound random.
 * @function rand
 * @param {string} number number of bytes in random number
 * @returns {Promise<BigInt>}
*/
async function rand(bytes:number):Promise<bigint> {
  const buf = await crypto.randomBytes(bytes);
  return new GN(buf.toString('hex'), 'hex').bigInt;
}

/**
 *  Rejection sampling for a value < maxVale
 * @function randValueLT
 * @param {string} maxValue Maximum possible value
 * @returns {Promise<string>}
 */
async function randValueLT(maxValue:string):Promise<string> {
  let genVal = BigInt(0);
  const zero = BigInt(0);
  const bigIntValue = BigInt(maxValue);
  const MAX_ATTEMPTS = 10000;
  const minimumBytes = Math.ceil(new GN(bigIntValue).binary.length / 8);
  let counter = 0;
  do {
    // eslint-disable-next-line no-await-in-loop
    genVal = await rand(minimumBytes);
    counter++;
  } while ((genVal >= bigIntValue || genVal === zero) && counter < MAX_ATTEMPTS);
  if (counter === MAX_ATTEMPTS) throw new Error("Couldn't make a number below target value");
  return '0x' + genVal.toString(16);
}

/**
 * Generates a random L2 Token address where bits 253 and 252 are set to 1
 * and bits 160 - 192 set to 0.
 *
 * @function randomL2TokenAddress
 * @returns {string} Valid L2 Token Address
 */
export async function randomL2TokenAddress():Promise<string>
{
    // random address is less thhan 1 << 160
   const randomAddress = await randValueLT("1461501637330902918203684832716283019655932542976");
   // set bits 253 and 252 to 1 
   const l2Address = generalise(
       BigInt(randomAddress) +
        BigInt("21711016731996786641919559689128982722488122124807605757398297001483711807488"),
    ).hex(32);

    return l2Address;
}

/**
 * Generate random number in BN128_GROUP_ORDER
 * 
 * @returns {string} Valid salt
 */
export async function randomSalt():Promise<string>
{
   const salt = await randValueLT(BN128_GROUP_ORDER)

   return salt;
}