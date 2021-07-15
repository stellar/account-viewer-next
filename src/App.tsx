import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { Layout } from "@stellar/design-system";

import { store } from "config/store";
import { Network } from "components/Network";
import { PrivateRoute } from "components/PrivateRoute";
import { Header } from "components/Header";
import { Theme } from "components/Theme";

import { Dashboard } from "pages/Dashboard";
import { Landing } from "pages/Landing";
import { NotFound } from "pages/NotFound";

import "styles.scss";

export const App = () => (
  <Provider store={store}>
    <Router>
      <Theme>
        <Network>
          <Header />

          <Layout.Content>
            <Layout.Inset>
              <Switch>
                <Route exact path="/">
                  <Landing />
                </Route>

                <PrivateRoute exact path="/dashboard">
                  <Dashboard />
                </PrivateRoute>

                <Route component={NotFound} />
              </Switch>
            </Layout.Inset>
          </Layout.Content>

          <Layout.Footer gitHubLink="https://github.com/stellar/account-viewer-v2" />
        </Network>
      </Theme>
    </Router>
  </Provider>
);
