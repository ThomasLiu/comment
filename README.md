# comment

## quick start
git clone https://github.com/ThomasLiu/comment.git
cd comment
npm install

## Run test
npm run test

## Run 
npm start

## Run pm2 for production
NODE_ENV=production pm2 start bin/www -i 0 --name 'commnet'

## Run pm2 for test
NODE_ENV=test pm2 start bin/www -i 0 --name 'test-commnet'


## API