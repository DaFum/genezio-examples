import {
  Button,
  Container,
  Row,
  Col,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
} from "reactstrap";
import { useState, useEffect } from "react";
import { TaskService } from "@genezio-sdk/getting-started-genezio-typescript-newest_us-east-1";
import { useNavigate } from "react-router-dom";
import TaskView from "./TaskView";
import uuid from "react-uuid";
import logo from "./logo.png";

export default function AllTasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<any[] | null>(null);
  const [modalAddTask, setModalAddTask] = useState<boolean>(false);
  const toggleModalAddTask = () => {
    setModalAddTask(!modalAddTask);
    setTaskTitle("");
  };

  const [error, setError] = useState<string>("");
  const [dbError, setDbError] = useState<string>("");

  const [taskTitle, setTaskTitle] = useState("");

  let initialized = false;

  // eslint-disable-next-line no-inner-declarations
  async function fetchTasks() {
    const res = await TaskService.getAllTasksByUser(
      localStorage.getItem("apiToken") || ""
    );

    if (!res.success) {
      setDbError(
        "Unexpected error, please check that your backend and environment variables are properly configured"
      );
      return;
    }
    if (res.success) {
      setTasks(res.tasks);
    }
  }
  useEffect(() => {
    if (!initialized) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      initialized = true;
      let token = localStorage.getItem("apiToken");
      if (!token) {
        token = uuid();
        localStorage.setItem("apiToken", token);
      }
    }
    if (!tasks && dbError == "") {
      fetchTasks();
    }
  }, [tasks, dbError]);

  async function handleDelete(id: string) {
    const res = await TaskService.deleteTask(
      localStorage.getItem("apiToken") || "",
      id
    );

    if (!res.success) {
      setDbError(
        "Unexpected error, please check that your backend and environment variables are properly configured"
      );
      navigate(0);
      return;
    }
    if (res.success) {
      navigate(0);
    }
  }

  async function handleEdit(id: string, title: string, solved: boolean) {
    console.log("handle edit called", id, title, solved);
    const res = await TaskService.updateTask(
      localStorage.getItem("apiToken") || "",
      id,
      title,
      solved
    );
    if (!res.success) {
      setDbError(
        "Unexpected error, please check that your backend and environment variables are properly configured"
      );
      navigate(0);
      return;
    }
    if (res.success) {
      const newTasks = tasks!.map((task) => {
        if (task.id === id) {
          task.title = title;
          task.solved = solved;
        }
        return task;
      });
      setTasks(newTasks);
    }
  }

  async function handleAdd(e: any) {
    e.preventDefault();
    setError("");
    if (!taskTitle) {
      setError("Title is mandatory");
      return;
    }
    const res = await TaskService.createTask(
      localStorage.getItem("apiToken") || "",
      taskTitle
    );
    if (!res.success) {
      setDbError(
        "Unexpected error, please check that your backend and environment variables are properly configured"
      );
      navigate(0);
      return;
    }
    if (res.success) {
      setTasks([...tasks!, res.task]);
      setTaskTitle("");
      toggleModalAddTask();
    }
  }

  return (
    <>
      <Modal isOpen={modalAddTask} toggle={toggleModalAddTask}>
        <ModalHeader toggle={toggleModalAddTask}>Add new task</ModalHeader>
        <form>
          <ModalBody>
            <span className="text-danger">{error}</span>
            <div className="mb-3">
              <label>Task Title</label>
              <Input
                className="form-control"
                placeholder="Title"
                type="text"
                autoComplete="Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={(e) => handleAdd(e)} type="submit">
              Add
            </Button>
            <Button color="secondary" onClick={toggleModalAddTask}>
              Cancel
            </Button>
          </ModalFooter>
        </form>
      </Modal>
      <Container className="mt-2">
        <Row className="mt-2">
          <Col sm="12">
            <Row>
              <Col sm="2" className="mt-4"></Col>
              <Col sm="8" style={{ backgroundColor: "white" }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img style={{ width: "50px" }} src={logo} alt="logo" />
                </div>
                <h3
                  style={{
                    marginBottom: "30px",
                    marginTop: "15px",
                    textAlign: "center",
                  }}
                >
                  Welcome to genezio!
                </h3>
                <p style={{ marginBottom: "30px", textAlign: "center" }}>
                  You have successfully deployed your first genezio project!
                </p>
                <p style={{ marginBottom: "30px", textAlign: "center" }}>
                  Here you have a list of resources that you can use to learn
                  how to continue building awesome projects with genezio:
                </p>
                {dbError != "" ? (
                  <Row>
                    <Alert color="danger">{dbError}</Alert>
                  </Row>
                ) : (
                  <></>
                )}

                {tasks != null ? (
                  tasks!.map((task: any) => (
                    <TaskView
                      key={task.id}
                      task={task}
                      onChange={handleEdit}
                      onDelete={handleDelete}
                    ></TaskView>
                  ))
                ) : (
                  <></>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "50px",
                  }}
                >
                  <Button
                    outline
                    color="secondary"
                    onClick={() => {
                      toggleModalAddTask();
                    }}
                  >
                    Add New Task
                  </Button>
                </div>
              </Col>

              <Col sm="2" className="mt-4"></Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
}
