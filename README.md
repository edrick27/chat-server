#Requirements:

- NVM
- NODEJS version 8.9.4


##RUN:

###Install dependencies:

```bash
cd project_root
npm install
```

###Develop:

```bash
DEBUG=dingdonechatserver:* npm start

or

./node_modules/nodemon/bin/nodemon.js --debug
```

##DOCS:

- https://pettigrew.rocks/2016/06/21/scaling-a-websocket-application-with-rabbitmq/
- https://github.com/rajaraodv/rabbitpubsub
- http://psitsmike.com/2011/10/node-js-and-socket-io-multiroom-chat-tutorial/
- https://gist.github.com/dskanth/2634239

- http://www.codershood.info/2016/01/24/sending-message-specific-user-socket-io/
- https://socket.io/docs/rooms-and-namespaces/
- https://gist.github.com/crtr0/2896891


- https://www.andrewmunsell.com/blog/install-rethinkdb-digitalocean/


https://www.digitalocean.com/community/tutorials/how-to-create-a-sharded-rethinkdb-cluster-on-ubuntu-14-04