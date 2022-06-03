import express from 'express';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import path from 'path';
import product from './routes/product.js';
import user from './routes/user.js';
import order from './routes/order.js';

import cors from 'cors';
import errorMiddleware from './middleware/error.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Route Imports
// const user = require('./routes/userRoute');
// const order = require('./routes/orderRoute');
// const payment = require('./routes/paymentRoute');

app.use('/api/v1', product);
app.use('/api/v1', user);
app.use('/api/v1', order);
// app.use('/api/v1', payment);

// app.use(express.static(path.join(__dirname, '../client/build')));

// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
// });

// Middleware for Errors
app.use(errorMiddleware);

// module.exports = app;

export default app;
