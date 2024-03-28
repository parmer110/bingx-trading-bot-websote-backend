import { useEffect, useState } from "react";
import { axiosBase } from "../../api/axios";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", email: "" });
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    // دریافت اطلاعات کاربر
    axiosBase.get("/admin/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  const handleAddUser = () => {
    // ارسال درخواست برای اضافه کردن کاربر جدید
    axiosBase.post("/admin/users", newUser)
      .then((response) => {
        setUsers([...users, response.data]);
        setNewUser({ username: "", email: "" });
        setIsAddingUser(false);
      })
      .catch((error) => {
        console.error("Error adding user:", error);
      });
  };

  const handleDeleteUser = (userId) => {
    // ارسال درخواست برای حذف کاربر با شناسه مشخص
    axiosBase.delete(`/admin/users/${userId}`)
      .then(() => {
        setUsers(users.filter((user) => user.id !== userId));
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
      });
  };

  const handleEditUser = (userId, updatedUserInfo) => {
    // ارسال درخواست برای ویرایش اطلاعات کاربر
    axiosBase.put(`/admin/users/${userId}`, updatedUserInfo)
      .then((response) => {
        const updatedUsers = users.map((user) =>
          user.id === userId ? response.data : user
        );
        setUsers(updatedUsers);
      })
      .catch((error) => {
        console.error("Error updating user:", error);
      });
  };

  return (
    <div>
      <h2>لیست کاربران</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.email}
            <button onClick={() => handleDeleteUser(user.id)}>حذف</button>
            <button onClick={() => handleEditUser(user.id, { username: "New Username" })}>ویرایش</button>
          </li>
        ))}
      </ul>

      {/* فرم اضافه کردن کاربر */}
      {isAddingUser && (
        <div>
          <input
            type="text"
            placeholder="نام کاربری جدید"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            type="email"
            placeholder="ایمیل جدید"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <button onClick={handleAddUser}>افزودن کاربر</button>
        </div>
      )}

      {/* دکمه اضافه کردن کاربر */}
      {!isAddingUser && <button onClick={() => setIsAddingUser(true)}>افزودن کاربر جدید</button>}
    </div>
  );
}
