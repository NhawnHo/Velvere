import { useEffect, useState } from 'react';

interface UserType {
    _id: string;
    user_id: number;
    name: string;
    password: string;
    email: string;
    phone: string;
    address: string;
}

function User() {
    const [users, setUsers] = useState<UserType[]>([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/users')
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((err) => console.error('Fetch user error:', err));
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Danh sách người dùng</h1>
            <table className="min-w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2">ID</th>
                        <th className="border px-4 py-2">Họ tên</th>
                        <th className="border px-4 py-2">Username</th>
                        <th className="border px-4 py-2">Passsword</th>
                        <th className="border px-4 py-2">Email</th>
                        <th className="border px-4 py-2">SĐT</th>
                        <th className="border px-4 py-2">Địa chỉ</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id}>
                            <td className="border px-4 py-2 text-center">
                                {user.user_id}
                            </td>
                            <td className="border px-4 py-2">{user.name}</td>
                            <td className="border px-4 py-2">{user.phone}</td>
                            <td className="border px-4 py-2">{user.password}</td>
                            <td className="border px-4 py-2">{user.email}</td>
                            <td className="border px-4 py-2">{user.phone}</td>
                            <td className="border px-4 py-2">{user.address}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default User;
