const sgMail = require('@sendgrid/mail')

const { sendgrid_api_key } = require('./keys')

sgMail.setApiKey(sendgrid_api_key)

const nullData = (data) => {
    if(!data) {
        const error = new Error("Error sending mail")
        error.statusCode = 500
        throw error
    };
    
}

const notifyUser = async (senderEmail, recipientEmail, prodName) => {
    const msg = {
        to: recipientEmail,
        from: 'victorotubure7@gmail.com',
        subject: `New Commment from ${senderEmail}`,
        html: `
            <h3> A new comment has been added to your product ${prodName} have successfully created an invoice with id: <strong> ${content} </strong> on smepay app </h3>
            <p> This is only completely visible on your profile </p>
            <br>

            <h4> You can view this comment by visiting <strong> appName after I fix heroku deployment </strong> </h2>
            <p> Thenk you for using ProductManagementApp </p>

            <h3> -- @customer.team </h3>
            <p> -- talented_vicky </p>
        `,
    };
    
    const result = await sgMail.send(msg)
    nullData(result)
}

const welcomeUser = async (userEmail) => {
    const msg = {
        to: userEmail,
        from: 'victorotubure7@gmail.com',
        subject: `New Account created for ${userEmail}`,
        html: `
            <h3> Welcome to Product Management App, your perfect product finder app </h3>
            <p> Head right back to explore our many features </p>
            <br>

            <p> Thenk you for signing up on ProductManagementApp </p>

            <h3> -- @customer.team </h3>
            <p> -- Betty Bee </p>
        `,
    };
    
    const result = await sgMail.send(msg)
    nullData(result)
}



module.exports = { notifyUser, welcomeUser }