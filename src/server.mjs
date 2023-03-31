import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';



// The GraphQL schema
//Schema = collection of type definitions
const typeDefs = `#graphql
  type Query {
    me: User
    users: [User!]
    user(id: ID!): User
    messages: [Message!]!
    message(id: ID!): Message!
  }
  type User {
    id: ID!
    username: String!
    messages: [Message!]
  }
  type Message {
    id: ID!
    text: String!
    user: User!
  }
`;

const users = [
  { id: '1', username: 'Zlatka N', messageId: '1' }, { id: '2', username: 'Robiin W', messageId: '2' }
]
const messages = [{ id: '1', text: 'Message 1', userId: '1' }, { id: '2', text: 'Message 1', userId: '2' }]
const me = users[0]
// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    me: (parent, args, { me }) => {
      return users[0]
    },
    user: (parent, { id }) => {
      return users[id]
    },
    users: () => users,
    messages: () => messages,
    message: (parent, { id }) => { return messages[id] }
  },
  User: {
    username: (parent) => {
      return parent.username
    },
    messages: (user) => {
      return messages.filter(message => message.userId === user.messageId)
    }
  },
  Message: {
    user: (parent, args, { me }) => {
      return users.find(user => {
        return user.id === parent.id
      })
    },
  },
};

const app = express();
const httpServer = http.createServer(app);
// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    me: users[0]
  },
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

app.use(
  cors(),
  bodyParser.json(),
  expressMiddleware(server),
);

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000`);
