Feature: User Login

  Scenario: Successful Login
    Given the user is on the login page
    When the user enters "user@example.com" and "password123"
    Then they should be redirected to the dashboard

  Scenario: Failed Login
    Given the user is on the login page
    When the user enters "wrong@user.com" and "wrongpass"
    Then they should see an error message "Invalid email or password"