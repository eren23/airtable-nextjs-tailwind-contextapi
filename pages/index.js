import Head from "next/head";
import Navbar from "../components/Navbar";
import Todo from "../components/Todo";
import { table, minifyRecords } from "./api/utils/Airtable";
import { useContext, useEffect } from "react";
import { TodosContext } from "../contexts/TodosContext";
import auth0 from "./api/utils/auth0";
import TodoForm from "../components/TodoForm";

export default function Home({ initialTodos, user }) {
  // console.log(initialTodos);

  const { todos, setTodos } = useContext(TodosContext);

  useEffect(() => {
    setTodos(initialTodos);
  }, []);

  return (
    <div>
      <Head>
        <title>Authenticaed Todo App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar user={user} />
      <main>
        {user && (
          <>
            <h1 className="text-2xl text-center mb-4"></h1>
            <TodoForm />
            <ul>
              {todos &&
                todos.map((todo) => {
                  return <Todo key={todo.id} todo={todo} />;
                })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await auth0.getSession(context.req);
  let todos = [];

  console.log(session);
  try {
    if (session?.user) {
      todos = await table
        .select({
          filterByFormula: `userId = '${session.user.sub}'`,
        })
        .firstPage();
    }
    return {
      props: {
        initialTodos: minifyRecords(todos),
        user: session?.user || null,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        err: "Something went wrong",
      },
    };
  }
}
