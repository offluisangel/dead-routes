import { getUsers } from './api';

export default async function UsersPage() {
  const users = await getUsers();
  return <div>{users.length} users</div>;
}