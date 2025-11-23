/**
 * @swagger
 * /api/diary:
 *   get:
 *     summary: Get all diary entries
 *     tags:
 *       - Diary
 *     responses:
 *       '200':
 *         description: list of diary entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DiaryEntry'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Create a diary entry
 *     tags:
 *       - Diary
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiaryEntry'
 *     responses:
 *       '201':
 *         description: created diary entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryEntry'
 *       '400':
 *         description: Invalid diary entry supplied (validation error)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/diary/{id}:
 *   get:
 *     summary: Get diary entry by id
 *     tags:
 *       - Diary
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: single diary entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryEntry'
 *       '400':
 *         description: Invalid id supplied or bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Diary entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Update diary entry by id
 *     tags:
 *       - Diary
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiaryEntry'
 *     responses:
 *       '200':
 *         description: updated diary entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiaryEntry'
 *       '400':
 *         description: Invalid diary entry supplied (validation error)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete diary entry by id
 *     tags:
 *       - Diary
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '204':
 *         description: deleted
 *       '404':
 *         description: Diary entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export {}

/**
 * @swagger
 * components:
 *   schemas:
 *     DiaryEntry:
 *       type: object
 *       additionalProperties: false
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           readOnly: true
 *           example: "c56a4180-65aa-42ec-a945-5fd21dec0538"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *           example: "2025-11-23T11:56:26.958Z"
 *         allergies:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *           example: 5
 *         infections:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *           example: 5
 *         stressLevel:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *           example: 5
 *         sleep:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *           example: 5
 *         nutrition:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *           example: 5
 *         symptoms:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *           example: 5
 *         miscellaneous:
 *           type: string
 *           maxLength: 5000
 *           example: "Miscellaneous notes"
 */
