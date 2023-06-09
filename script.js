// server database variables
let users = JSON.parse(localStorage.getItem(`users`)) || []; // Array of Users
let user = JSON.parse(localStorage.getItem(`user`)); 

// arrow functions for ES6
const getDom = (selector) => document.querySelector(selector);
const getDomAll = (selector) => document.querySelectorAll(selector);
const conLog = (firstItemToLog, secondItemToLog) => secondItemToLog ? console.log(firstItemToLog, secondItemToLog) : console.log(firstItemToLog);

// hide forms
const hideSignUpForm = () => getDom(`.signup`).style.display = `none`;
const hideSignInForm = () => getDom(`.signin`).style.display = `none`;
// submit buttons that hide forms
hideSignInForm();

// the next few variables are HTML references
let signupForm = getDom(`#signup`);
let loginForm = getDom(`#login`);
let profileSection = getDom(`.profileSection`);
let usersCount = getDom(`.usersCount`);
let signedinForm = getDom(`form#signedin`);

if (usersCount) usersCount.innerHTML = users.length;

const checkUserData = (user) => {
    if (user.number) {
        // this is when the page first loads, it displays the number
        let userNumberElement = getDom(`.userNumber`);
        userNumberElement.innerHTML = user.number;
    }

    if ((!user.status || user.status == ``) && (!user.occupation || user.occupation == ``)) {
        getDom(`.userMeta`).style.display = `none`;
    } else {
        getDom(`.userMeta`).style.display = `flex`;
    }

    if (user.status) {
        getDom(`.statusDisplay`).innerHTML = user.status;
        getDom(`.statusDisplay`).style.display = `flex`;
        getDom(`.displayField.status`).style.display = `flex`;
    } else {
        getDom(`.displayField.status`).style.display = `none`;
    }
    
    if (user.occupation) {
        getDom(`.occupationDisplay`).innerHTML = user.occupation;
        getDom(`.occupationDisplay`).style.display = `flex`;
        getDom(`.displayField.occupation`).style.display = `flex`;
    } else {
        getDom(`.displayField.occupation`).style.display = `none`;
    }
}

const updateUserUI = (formFields, user) => {
    // we need to get every update form field and update the UI with the new values
    let formFieldDisplays = getDomAll(`.formFieldDisplay`);
    formFieldDisplays.forEach((display, displayIndex) => {
        if (formFields[displayIndex].value != ``) {
            if (display.classList.contains(formFields[displayIndex].name)) {
                display.innerHTML = formFields[displayIndex].value;
            } 
        }
    })
    checkUserData(user);
}

// this code will run on page load but we need to also update after the user submits the form
if (user) {
    getDom(`.formsSection`).remove();
    getDom(`.userEmail`).append(user.username ?? user.email);

    checkUserData(user);

    if (signedinForm) {
        // Create a new function to update the users profile
        signedinForm.addEventListener(`submit`, SignedInFormSubmitEvent => {
            SignedInFormSubmitEvent.preventDefault();
            let formFields = getDomAll(`.formField`);

            Object.assign(user, ...([...formFields].map(field => {
                if (field.value != ``) {
                    return {
                        [field.name]: field.value
                    }
                }
            })))

            localStorage.setItem(`user`, JSON.stringify(user));

            // And Update our User Base to have the Updated User
            if (users.length > 0) {
                // We have updated the user above
                // now we need to check if the user that we updated above already exists in our users database
                users = users.map((User, i) => {
                    if (User.id == user.id) {
                        return user;
                    }
                    return User;
                });
                localStorage.setItem(`users`, JSON.stringify(users));
            }
            updateUserUI(formFields, user);
        })
    }
} else {
    profileSection.remove();
}

// Define function, when declaring it, it delets local user
const logUserOut = () => {
    user = null;
    localStorage.removeItem(`user`);
    window.location.reload();
}

// Define functions
const addNewUser = (newUser) => {
    users.push(newUser);
    localStorage.setItem(`users`, JSON.stringify(users));
}

// buttons
let logoutButton = getDom(`.logoutButton`);
let loginpageButton = getDom(`.button-3`);
let createaccountButton = getDom(`.button-1`);

if (logoutButton) {
    logoutButton.addEventListener(`click`, LogOutClickEvent => {
        // When the user clicks log out, we need to erase the stored user data
        // Declare or Use the Function
        logUserOut();
    });
}

if (loginpageButton) {
    loginpageButton.addEventListener(`click`, LogInClickEvent => {
        hideSignUpForm();
        getDom(`.signin`).style.display = `flex`;
    });
}

if (createaccountButton) {
    createaccountButton.addEventListener(`click`, CreateAccountClickEvent => {
        hideSignInForm();
        getDom(`.signup`).style.display = `flex`;
    });
}


if (signupForm) {
    signupForm.addEventListener(`submit`, SignUpFormSubmitEvent => {
        // Forms have a default behavior, we need to prevent this
        SignUpFormSubmitEvent.preventDefault();

        // Defining what happens when the form is submitted
        let emailField = getDom(`#email`);
        let passwordField = getDom(`#password`);

        let year = new Date().getFullYear();
        let uniqueID = users.length + 1 + `-` + year;
        // Create new user
        // When i have the email and password, i need to create a new user from it
        let newUser = {
            id: uniqueID,
            email: emailField.value,
            password: passwordField.value
        };

        if (users.length > 0) {
            // if the user is not already registered with us then create a new account.
            let userEmails = users.map((User, i) => User.email);

            if (userEmails.includes(newUser.email)) {
                alert(`Hey, you're already registered, we are sending you to the log in form.`);
                // implement login logic here
                // we have already captured the user email 
                hideSignUpForm();
                getDom(`.signin`).style.display = `flex`;
                getDom(`#login-email`).value = newUser.email;
                // next we need to verify the password 
                return;
            } else {
                addNewUser(newUser);
            }
        } else {
            addNewUser(newUser);
        }

        // Store the user in local storage
        localStorage.setItem(`user`, JSON.stringify(newUser));
        window.location.reload();
    });
}

if (loginForm) {
    loginForm.addEventListener(`submit`, loginFormSubmitEvent => {
        // Forms have a default behavior, we need to prevent this
        loginFormSubmitEvent.preventDefault();

        let emailField = getDom(`#login-email`);
        let passwordField = getDom(`#login-password`);

        let userEmails = users.map((User, i) => User.email);

        if (userEmails.includes(emailField.value)) {
            conLog(`found matching email`, emailField.value);
            let thisUser = users.find(User => User.email == emailField.value);
            conLog(`found matching account`, thisUser);
            if (thisUser.password == passwordField.value) {
                //sign the user in
                user = thisUser;
                localStorage.setItem(`user`, JSON.stringify(user));
                window.location.reload();
            } else {
                alert(`incorrect password`);
                return;
            }
        } else {
            alert(`No account was found with this email, please sign up`);
            getDom(`.signup`).style.display = `flex`;
            getDom(`.signin`).style.display = `none`;
            getDom(`#password`).value = "";
        }        
    });
}

// SQL databases are more complex, but have more power such as relationships

// This person is a friend of this person who likes the others persons Comment

// Because of this, big production like to use SQL

// For simpler projects, or simpler data with no relationships, you can use NoSQL Databases like Firebase

// Even when its no SQL Database, like Firebase, Firebase has extra tools that let you create relationships even though you're not using SQL.

// These tools are known as ORM. Or Object Relational Map