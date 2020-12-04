import jwt from 'jsonwebtoken'
export const decodeToken = async (token) => {
  try {
    const result = await jwt.verify(token, 'net ninja secret');
    if (result) return result;
    else throw new Error('SOME THING WRONG WITH TOKEN');
  }catch (err) {
    return err;
  }
}