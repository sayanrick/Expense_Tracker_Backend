const uuid = require('uuid');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');

const User = require('../models/users');
const Forgotpassword = require('../models/forgotpassword');

exports.forgotpassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (user) {
            const id = uuid.v4();
            await user.createForgotpassword({ id, active: true });

            sgMail.setApiKey(process.env.API_KEY);

            const msg = {
                to: email,
                from: 'sayanrickdas@gmail.com',
                subject: 'Password Reset Request',
                text: 'Click the link to reset your password.',
                html: `<a href="http://localhost:5000/password/resetpassword/${id}">Reset password</a>`,
            }

            await sgMail.send(msg);

            return res.status(200).json({ message: 'Password reset link sent to your email', success: true });
        } else {
            throw new Error('User does not exist');
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message, success: false });
    }
}

exports.resetpassword = async (req, res) => {
    const id = req.params.id;

    try {
        const forgotpasswordrequest = await Forgotpassword.findOne({ where: { id } });

        if (forgotpasswordrequest && forgotpasswordrequest.active) {
            await forgotpasswordrequest.update({ active: false });

            return res.status(200).send(`
                <html>
                    <script>
                        function formsubmitted(e) {
                            e.preventDefault();
                            console.log('called');
                        }
                    </script>
                    <form action="/password/updatepassword/${id}" method="get">
                        <label for="newpassword">Enter New password</label>
                        <input name="newpassword" type="password" required></input>
                        <button>Reset Password</button>
                    </form>
                </html>`
            );
        } else {
            return res.status(403).json({ message: 'Invalid or expired reset link', success: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
}


exports.updatepassword = async (req, res) => {
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        const resetpasswordrequest = await Forgotpassword.findOne({ where: { id: resetpasswordid } });
        
        if (resetpasswordrequest && resetpasswordrequest.active) {
            const user = await User.findOne({ where: { id: resetpasswordrequest.userId } });
            
            if (user) {
                const saltRounds = 10;
                bcrypt.genSalt(saltRounds, async (err, salt) => {
                    if (err) {
                        console.log(err);
                        throw new Error(err);
                    }
                    bcrypt.hash(newpassword, salt, async (err, hash) => {
                        if (err) {
                            console.log(err);
                            throw new Error(err);
                        }
                        await user.update({ password: hash });
                        await resetpasswordrequest.update({ active: false });
                        return res.status(201).json({ message: 'Password updated successfully', success: true });
                    });
                });
            } else {
                return res.status(404).json({ message: 'User does not exist', success: false });
            }
        } else {
            return res.status(403).json({ message: 'Invalid or expired reset link', success: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
}
