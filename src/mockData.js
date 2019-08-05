import { v4 as uuid } from 'uuid';

const mockUsers = () => [
  {
    id: uuid(),
    username: 'john.smith',
    password_hash: 'smith',// TODO: hash
    first_name: 'john',
    last_name: 'smith',
  }
];

const mockData = () => ({
  users: mockUsers(),
});

export default mockData;

export const defaultData = {
  users: [],
};
