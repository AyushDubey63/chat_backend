export const verifyAccount = ({ email, token, user_name }) => {
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
        9999
    </div>
    
    <p>For your security, this OTP is valid for the next 10 minutes. If you did not request this OTP, please ignore this email.</p>

    <p>Alternatively, you can verify your email address by clicking the button below:</p>
    
    <a href="http://localhost:3001/api/v1/auth/verify-user/${email}/${token}/${user_name}" class="button">Click Here to Verify</a>

    
</div>

</body>
</html>
`;
};
