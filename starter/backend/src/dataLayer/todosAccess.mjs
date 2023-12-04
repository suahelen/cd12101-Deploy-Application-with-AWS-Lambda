import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


import AWSXRay from 'aws-xray-sdk-core';
import { v4 } from 'uuid';

import { createLogger } from '../utils/logger.mjs';

export class TodosAccess {
    constructor(
        docClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
        todosTable = process.env.TODOS_TABLE,
        userIdIndex = process.env.USER_ID_INDEX,
        s3Client = new S3Client({ region: process.env.REGION }),
        bucketName = process.env.ATTACHMENTS_S3_BUCKET,
        urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {
        this.docClient = docClient;
        this.todosTable = todosTable;
        this.userIdIndex = userIdIndex;
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.urlExpiration = urlExpiration;
        this.dynamoDbClient = DynamoDBDocument.from(this.docClient);
        this.logger = createLogger('TodosAccess');
    }


    async createTodoItem(newTodo, userId) {
        const todoId = v4();
        const newItem = {
            todoId,
            userId,
            createdAt: new Date().toISOString(),
            done: false,
            ...newTodo,
        };
        await this.dynamoDbClient.put({
            TableName: this.todosTable,
            Item: newItem
        })

        this.logger.info('Created new todo item: ', newItem);
        return newItem;
    }

    async getTodoItems(userId) {
        const result = await this.dynamoDbClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })

        this.logger.info('Found number of items: ', result.Count);
        return result.Items;
    }

    async updateTodoItem(todoId, userId, updatedTodo) {
        const params = {
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': updatedTodo.name,
                ':dueDate': updatedTodo.dueDate,
                ':done': updatedTodo.done
            },
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ReturnValues: 'UPDATED_NEW'
        }
        const result = await this.dynamoDbClient.update(params)

        this.logger.info('Updated todo item: ', result.Attributes);
        return result.Attributes;
    }

    async deleteTodoItem(todoId, userId) {
        const params = {
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }
        await this.dynamoDbClient.delete(params)
        this.logger.info('Deleted todo item: ', params.Key);
    }

    async updateAttachmentUrl(todoId, userId) {
        const attachmentUrl = this.getAttachementUrl(todoId);
        const params = {
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
            },
            ReturnValues: 'UPDATED_NEW'
        }
        const result = await this.dynamoDbClient.update(params)

        this.logger.info('Updated todo item: ', result.Attributes);
        return result.Attributes;
    }

    getAttachementUrl(todoId) {
        return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`;
    }

    async generateUploadUrl(todoId) {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: todoId
        });
        this.logger.info('Generating upload URL: ', command);
        const uploadUrl = getSignedUrl(this.s3Client, command, { expiresIn: this.urlExpiration });

        this.logger.info('Generated upload URL: ', uploadUrl);
        return uploadUrl;
    }

}