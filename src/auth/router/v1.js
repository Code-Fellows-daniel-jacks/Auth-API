'use strict';

const express = require('express');
const dataModules = require('../models');

const router = express.Router();

// console.log(req.params.model);
// console.log(dataModules);
router.param('model', (req, res, next) => {
  const modelName = req.params.model;
  if (dataModules[modelName]) {
    req.model = dataModules[modelName];
    next();
  } else {
    next('Invalid Model');
  }
});

router.get('/:model', handleGetAll);
router.get('/:model/:id', handleGetOne);
router.post('/:model', handleCreate);
router.put('/:model/:id', handleUpdate);
router.delete('/:model/:id', handleDelete);

async function handleGetAll(req, res, next) {
  try {
    let allRecords = await req.model.get();
    res.status(200).json(allRecords);
  } catch (e) {
    next(e.message);
  }
}

async function handleGetOne(req, res, next) {
  try {
    const id = req.params.id;
    console.log(id);
    console.log(req.model);
    let theRecord = await req.model.get(id);
    res.status(200).json(theRecord);
  } catch (e) {
    next(e.message);
  }
}

async function handleCreate(req, res, next) {
  try {
    let obj = req.body;
    let newRecord = await req.model.create(obj);
    res.status(201).json(newRecord);
  } catch (e) {
    next(e.message);
  }
}

async function handleUpdate(req, res, next) {
  try {
    const id = req.params.id;
    const obj = req.body;
    let updatedRecord = await req.model.update(id, obj);
    res.status(200).json(updatedRecord);
  } catch (e) {
    next(e.message);
  }
}

async function handleDelete(req, res, next) {
  try {
    let id = req.params.id;
    let deletedRecord = await req.model.delete(id);
    res.status(200).json(deletedRecord);
  } catch (e) {
    next(e.message);
  }
}


module.exports = router;
