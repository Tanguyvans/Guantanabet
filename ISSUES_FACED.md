## Protokit

### First Issue

In the starter-kit folder, we had to run the following command to create the chain:

```
npx degit proto-kit/starter-kit#develop my-chain
```

We had a problem with the apps/web/package.json file.

The fix was to change the version of the protokit packages to the following:

```json
  "peerDependencies": {
    "@proto-kit/api": "0.1.1-develop.1088",
    "@proto-kit/common": "0.1.1-develop.1088",
    "@proto-kit/deployment": "0.1.1-develop.1088",
    "@proto-kit/library": "0.1.1-develop.1088",
    "@proto-kit/module": "0.1.1-develop.1088",
    "@proto-kit/persistance": "0.1.1-develop.1088",
    "@proto-kit/protocol": "0.1.1-develop.1088",
    "@proto-kit/sdk": "0.1.1-develop.1088",
    "@proto-kit/sequencer": "0.1.1-develop.1088",
    "@proto-kit/indexer": "0.1.1-develop.1088",
    "o1js": "1.6.0",
    "tsyringe": "^4.7.0"
  }
```

### Second Issue

This repo doesn't have the frontend linked to the contract: https://github.com/codekaya/
