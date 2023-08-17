import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { userColumns } from "../../datatablesource";

interface UserData {
    id: string;
    [key: string]: any;
}

const Datatable: React.FC = () => {
  const [data, setData] = useState<UserData[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "users"),
      (snapShot) => {
        const list: UserData[] = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as UserData);
        });
        setData(list);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsub();
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "users", id));
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link to="/createadminpage" className="ml-2 text-blue-500 hover:text-blue-700">
          Add New User
        </Link>
      </div>
      <table className="w-full table-auto">
        <thead>
          <tr>
            {userColumns.map((column) => (
              <th key={column.field}>{column.headerName}</th>
            ))}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              {userColumns.map((column) => (
                <td key={column.field}>{row[column.field]}</td>
              ))}
              <td>
                <Link
                  to=""
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </Link>
                <span className="mx-2">|</span>
                <span
                  className="cursor-pointer text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(row.id)}
                >
                  Delete
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Datatable;
