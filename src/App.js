import React, { Suspense, lazy } from 'react';
import {
  Route,
  Routes,
  BrowserRouter as Router,
  Navigate,
  Outlet,
} from 'react-router-dom';
import CheckAuth from './Auth/CheckAuth';
import PostList from './Days/PostList';
const Days = lazy(() => import(/* webpackChunkName: "days" */ './Days'));
const NewEntry = lazy(() =>
  import(/* webpackChunkName: "days" */ './Days/NewEntry'),
);
const Transactions = lazy(() =>
  import(/* webpackChunkName: "transactions" */ './Transactions'),
);
const Notes = lazy(() => import(/* webpackChunkName: "tasks" */ './Notes'));
const Note = lazy(() => import(/* webpackChunkName: "tasks" */ './NoteShow'));
const Sandbox = lazy(() =>
  import(/* webpackChunkName: "sandbox" */ './Sandbox'),
);
const Projects = lazy(() =>
  import(/* webpackChunkName: "projects" */ './Projects'),
);
const Project = lazy(() =>
  import(/* webpackChunkName: "project-show" */ './ProjectShow'),
);
const Wishlist = lazy(() =>
  import(/* webpackChunkName: "wishlist" */ './Wishlist'),
);
const WorldMap = lazy(() =>
  import(/* webpackChunkName: "wishlist" */ './WorldMap'),
);
const LastTime = lazy(() =>
  import(/* webpackChunkName: "last-time" */ './LastTime'),
);
const LoginPage = lazy(() =>
  import(/* webpackChunkName: "login" */ './Auth/Login'),
);
const Layout = lazy(() => import(/* webpackChunkName: "layout" */ './Layout'));
const RegistrationPage = lazy(() =>
  import(/* webpackChunkName: "registration" */ './Auth/Registration'),
);
const DaysApp = lazy(() =>
  import(/* webpackChunkName: "days-app" */ './Days/DaysApp'),
);
const DaysSettings = lazy(
  /* webpackChunkName: "days-settings" */ () => import('./Days/Settings'),
);
const Search = lazy(
  /* webpackChunkName: "days-search" */ () => import('./Days/Search'),
);
const TransactionsList = lazy(() =>
  import(
    /* webpackChunkName: "transactions-list" */ './Transactions/TransactionsList'
  ),
);
const TransactionsCreate = lazy(() =>
  import(
    /* webpackChunkName: "transactions-add" */ './Transactions/TransactionsCreate'
  ),
);
const TransactionsCategories = lazy(() =>
  import(
    /* webpackChunkName: "transactions-cats" */ './Transactions/TransactionsCategories'
  ),
);
const TransactionsStatistics = lazy(() =>
  import(
    /* webpackChunkName: "transactions-stats" */ './Transactions/TransactionsStatistics'
  ),
);
const WishCreate = lazy(() =>
  import(/* webpackChunkName: "wish-add" */ './Wishlist/WishCreate'),
);
const WishList = lazy(() =>
  import(/* webpackChunkName: "wish-list" */ './Wishlist/WishList'),
);

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/signup" element={<RegistrationPage />} />
          <Route
            path="/"
            element={
              <CheckAuth>
                <Layout>
                  <Suspense fallback="Loading...">
                    <Outlet />
                  </Suspense>
                </Layout>
              </CheckAuth>
            }
          >
            <Route path="days" element={<Days />}>
              <Route index element={<NewEntry />} />
              <Route path="app" element={<DaysApp />} />
              <Route path="settings" element={<DaysSettings />} />
              <Route path="search" element={<Search />} />
              <Route path="history" element={<PostList tab="history" />} />
            </Route>
            <Route path="transactions" element={<Transactions />}>
              <Route path="add" element={<TransactionsCreate />} />
              <Route path="list" element={<TransactionsList />} />
              <Route path="categories" element={<TransactionsCategories />} />
              <Route path="statistics" element={<TransactionsStatistics />} />
            </Route>
            <Route path="notes">
              <Route index element={<Notes />} />
              <Route path=":id" element={<Note />} />
            </Route>
            <Route path="projects">
              <Route index element={<Projects />} />
              <Route path=":id" element={<Project />} />
            </Route>
            <Route path="last-time" element={<LastTime />} exact />
            <Route path="sandbox" element={<Sandbox />} exact />
            <Route path="wishlist" element={<Wishlist />}>
              <Route path="add" element={<WishCreate />} />
              <Route path="list" element={<WishList />} />
            </Route>
            <Route path="world-map" element={<WorldMap />} />
            <Route path="/" exact element={<Navigate to="/days" />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
