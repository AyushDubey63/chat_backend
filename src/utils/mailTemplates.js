const verifyAccount = ({ email, token, user_name, otp }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .container {
            max-width: 500px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            border-top: 4px solid #007bff;
        }

        .header {
            text-align: center;
            padding-bottom: 20px;
        }

        h2 {
            font-size: 28px;
            color: #333;
            margin: 0;
            font-weight: bold;
        }

        p {
            font-size: 16px;
            line-height: 1.5;
            margin: 10px 0;
        }

        .otp {
            font-size: 30px;
            font-weight: bold;
            color: #007bff;
            text-align: center;
            margin: 20px 0;
        }

        .button {
            display: block;
            width: 100%;
            max-width: 250px; /* Optional: you can adjust the button's max width */
            margin: 20px auto; /* This will center the button horizontally */
            background-color: #007bff;
            color: white;
            padding: 14px 30px;
            font-size: 16px;
            text-decoration: none;
            border-radius: 5px;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }

        .button:hover {
            background-color: #0056b3;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            margin-top: 30px;
        }

        .footer a {
            color: #007bff;
            text-decoration: none;
        }

        .footer p {
            margin: 5px 0;
        }

        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }
            .button {
                padding: 12px 25px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h2>Account Verification</h2>
    </div>
    <p>Hello ${user_name},</p>
    <p>Thank you for signing up with us!</p>
    <p>To complete your registration and verify your account, please use the following One-Time Password (OTP):</p>
    
    <div class="otp">
        ${otp}
    </div>
    
    <p>For your security, this OTP is valid for the next 10 minutes. If you did not request this OTP, please ignore this email.</p>

    <p>Alternatively, you can verify your email address by clicking the button below:</p>
    
    <a href="${process.env.SERVER_URL}/api/v1/auth/verify-user/${email}/${token}/${user_name}" class="button">Click Here to Verify</a>

    
</div>

</body>
</html>
`;
};
const otpSentSuccessfully = () => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
            text-align: center;
            color: #333;
        }
        p {
            font-size: 16px;
            line-height: 1.5;
            color: #555;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>OTP Verification</h2>
        <p>An OTP has been sent to your email address. Please check your email and verify your account by entering the OTP.</p>
        <p>If you didn’t receive the email, kindly check your spam folder.</p>
        
    </div>
</body>
</html>
`;
console.log(process.env.SERVER_URL, 172);
const resetPassword = ({ email, user_name, token }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        /* Reset styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7fa;
            color: #333;
            line-height: 1.6;
        }
        .email-wrapper {
            width: 100%;
            background-color: #f4f7fa;
            padding: 20px;
            text-align: left;
        }
        .email-content {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            margin: 0 auto;
        }
        h2 {
            font-size: 28px;
            color: #4a90e2;
            margin-bottom: 30px;
            text-align: center;
        }
        p {
            font-size: 16px;
            color: #555;
            margin-bottom: 20px;
        }
        .greeting {
            font-size: 18px;
            color: #333;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .button-container {
            text-align: center; /* Center the button */
            margin-top: 20px;
        }
        .button {
            display: inline-block;
            padding: 15px 30px;
            background-color: #4a90e2;
            color: white;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 10px;
            transition: background-color 0.3s ease, transform 0.3s ease;
        }
        .button:hover {
            background-color: #357ab7;
        }
        .footer {
            font-size: 12px;
            color: #aaa;
            margin-top: 30px;
        }
        .footer p {
            margin: 5px 0;
        }
        .divider {
            margin: 30px 0;
            height: 1px;
            background-color: #e0e0e0;
            border: none;
        }
        /* Mobile responsiveness */
        @media (max-width: 600px) {
            .email-content {
                padding: 20px;
            }
            h2 {
                font-size: 24px;
            }
            .button {
                width: 100%;
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-content">
            <h2>Password Reset Request</h2>
            <p class="greeting">Hello ${user_name},</p>
            <p>We received a request to reset your password. To proceed with the password reset, please click the button below:</p>
            
            <div class="button-container">
                <a href="${process.env.SERVER_URL}/api/v1/auth/reset-password/${email}/${token}" class="button">Reset Password</a>
            </div>
            
            <p style="font-size: 14px; color: #f44336; text-align: center; margin-top: 10px;">Due to security reasons this link is only valid for 5 minutes.</p>
            
            <div class="divider"></div>
            
            <p>If you did not request a password reset, please ignore this email.</p>
            
        </div>
    </div>
</body>
</html>


`;
const linkExpiredTemplate = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Link Expired</title>
    <style>
        /* Reset styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7fa;
            color: #333;
            line-height: 1.6;
        }
        .email-wrapper {
            width: 100%;
            background-color: #f4f7fa;
            padding: 20px;
            text-align: center;
        }
        .email-content {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            margin: 0 auto;
        }
        h2 {
            font-size: 24px;
            color: #e74c3c;
            margin-bottom: 20px;
        }
        p {
            font-size: 16px;
            color: #555;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            padding: 15px 30px;
            background-color: #4a90e2;
            color: white;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 10px;
            transition: background-color 0.3s ease, transform 0.3s ease;
        }
        .button:hover {
            background-color: #357ab7;
        }  margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-content">
            <h2>Password Reset Link Expired</h2>
            <p>The link you clicked to reset your password has expired. Please request a new one below.</p>
            
            <a href="${process.env.CLIENT_URL}/forgot-password" class="button">Request New Link</a>
            
            
        </div>
    </div>
</body>
</html>
`;
export {
  verifyAccount,
  otpSentSuccessfully,
  resetPassword,
  linkExpiredTemplate,
};
