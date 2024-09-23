import React from "react";
import "./Users.css";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

export default class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      users: [],
      name: "",
      email: "",
      password: "",
      editingUser: null, // Track which user is being edited
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers() {
    fetch("http://127.0.0.1:8000/api/users")
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            users: result,
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
  }

  handleInputChange(event) {
    const { name, value } = event.target;

    this.setState({
      [name]: value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { name, email, password, editingUser } = this.state;

    const url = editingUser
      ? `http://127.0.0.1:8000/api/users/${editingUser.id}`
      : "http://127.0.0.1:8000/api/users";
    const method = editingUser ? "PUT" : "POST";

    const requestBody = editingUser
      ? { name, email } // Exclude password when editing
      : { name, email, password };

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          if (editingUser) {
            this.setState((prevState) => ({
              users: prevState.users.map((user) =>
                user.id === editingUser.id ? result : user
              ),
              editingUser: null, // Reset editing state
              name: "",
              email: "",
              password: "",
            }));
          } else {
            this.setState((prevState) => ({
              users: [...prevState.users, result],
              name: "",
              email: "",
              password: "",
            }));
          }
        },
        (error) => {
          this.setState({ error });
        }
      );
  }

  handleEdit(user) {
    this.setState({
      editingUser: user,
      name: user.name,
      email: user.email,
      password: "", // Do not populate password for security
    });
  }

  handleDelete(userId) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn_delete_it btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
            method: "DELETE",
          })
            .then(() => {
              this.setState((prevState) => ({
                users: prevState.users.filter((user) => user.id !== userId),
              }));

              swalWithBootstrapButtons.fire({
                title: "Deleted!",
                text: "The user has been deleted.",
                icon: "success",
              });
            })
            .catch((error) => {
              this.setState({ error });
              Swal.fire({
                title: "Error!",
                text: "There was an issue deleting the user.",
                icon: "error",
              });
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire({
            title: "Cancelled",
            text: "Your user is safe :)",
            icon: "error",
          });
        }
      });
  }

  render() {
    const { error, isLoaded, users, name, email, password, editingUser } =
      this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <div>
          <form action="http://127.0.0.1:8000/api/users" method="POST">
            <div>
              <h2 className="main"> Add User</h2>
              <input name="link" type="hidden" value={window.location} />
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={this.handleInputChange}
                  required
                />
              </label>
            </div>
            <div>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={this.handleInputChange}
                  required
                />
              </label>
            </div>
            {/* Show password field only when adding a new user */}
            {!editingUser && (
              <div>
                <label>
                  Password:
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={this.handleInputChange}
                    required
                  />
                </label>
              </div>
            )}
            <button type="submit">
              {editingUser ? "Update User" : "Add User"}
            </button>
          </form>

          <h2 className="main"> All Users</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <button
                      className="btn_edit"
                      onClick={() => this.handleEdit(user)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn_delete"
                      onClick={() => this.handleDelete(user.id)}
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
}
