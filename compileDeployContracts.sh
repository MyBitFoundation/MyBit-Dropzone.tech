export TRUFFLE_NETWORK=$1
export METAMASK_NETWORK=$2
echo "truffle_network=$TRUFFLE_NETWORK"
echo "metamask_network=$METAMASK_NETWORK"

pwd
export DEST="./front-end/app/constants/contracts/$METAMASK_NETWORK"

truffle migrate --reset --network $TRUFFLE_NETWORK

echo "export const ABI =" > $DEST/MyBitToken.js
cat ./build/contracts/ERC20.json | jq -r .abi >> $DEST/MyBitToken.js

echo "export const ABI = " > $DEST/MyBitBurner.js
cat ./build/contracts/MyBitBurner.json | jq -r .abi >> $DEST/MyBitBurner.js

echo "export const ABI = " > $DEST/ERC20Airdrop.js
cat ./build/contracts/ERC20Airdrop.json | jq -r .abi >> $DEST/ERC20Airdrop.js

