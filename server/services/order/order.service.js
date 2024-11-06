const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
require("dotenv").config();

const hashpwd = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(12));

class OrderService {
    constructor(client) {
        this.Order = client.db().collection("orders");
    }

    extractOrderData(payload) {
        const order = {
            //   name: payload.name,
            //   email: payload.email,
            //   password: payload.password ? hashpwd(payload.password) : '',
            //   address: payload.address,
            //   phone: payload.phone,
            //   refreshToken: payload.refreshToken,
            //   img: payload.img,
            //   oauth: payload.oauth,
            //   isAdmin: payload.isAdmin,
        };
        Object.keys(order).forEach(
            (key) => order[key] === undefined && delete order[key]
        );
        return order;
    }

    async create(payload) {
        try {
            const data = this.extractOrderData(payload);

            await this.Order.findOneAndUpdate(
                data,
                { returnDocument: "after", upsert: true }
            );

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async OrderRoom(payload) {
        const idUser = payload.info.idUser;

        const result = await this.User.findOneAndUpdate(
            { _id: ObjectId.isValid(idUser) ? new ObjectId(idUser) : null },
            {
                $push: {
                    order: payload.info,
                },
            },
            { returnDocument: "after" }
        );

        return result;
    }

    async updateOrder(payload) {
        const idOrder = payload.idOrder;
    
        const updateFields = {};
        // if (payload.email) updateFields.email = payload.email;
        // if (payload.password) updateFields.password = payload.password;
        // if (payload.phone) updateFields.phone = payload.phone;
        if (payload.name) updateFields.name = payload.name;
        if (payload.address) updateFields.address = payload.address;
        if (payload.img) updateFields.img = payload.img;
    
        const result = await this.User.findOneAndUpdate(
          {
            _id: ObjectId.isValid(idUser) ? new ObjectId(idUser) : null,
          },
          {
            $set: updateFields,
          },
          { returnDocument: "after" }
        );
        return result;
      }
}

module.exports = OrderService;