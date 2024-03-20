# Db API

Drosse leverages [LokiJS](https://github.com/techfort/LokiJS) power to allow stateful interactive mocking. But don't worry, no need for database configuration or any complicated stuffs. Basically, LokiJS is a nosql document database (a bit like mongo, but way simpler).

When you start your mock server for the first time, Drosse will create a database and store it in a `mocks.json` file in your `[mocks root]` directory. Yes! You've read it, it's a simple JSON file. You can open it in your IDE and see the content of your database. But don't modify it manually, it will probably break the database. To be precise, LokiJS is a in-memory database and it will simply dump its content every 4 seconds in the `mocks.json` file.

> :anguished: How do I update it, then ?

LokiJS is collections-based. You can consider each collection as an array of objects, each object being a document.

To provide some contents to your database, you need to create a `collections` directory in your `[mocks root]` directory. In this directory you will define your collections. A collection can be either:

- A directory that contains JSON files. These files must contain a JSON object (not an array).
- A JSON files that must contain an array of objects.

In the end it's the same. Drosse will process either the directory or the big JSON file and insert it as a new collection full of documents in your database.

!!! note
    You can redefine the `mocks.json` database file and the `collections` directory name in your `.drosserc.js` file (see [Configuration](configuration.md)).

By default, on each startup Drosse will check the `collections` directory and see if the collection already exists in the database. If not, it will import it. If the collection already exists, Drosse won't import it again; even if you added new files in the collection directory.

If you want a fresh database, simply delete the `mocks.json` file and restart Drosse.

!!! tip
    You can also type directly `db drop` in the Drosse CLI to achieve the same goal.

> :sweat_smile: That's a bit hard! Is there a smoother way?

You ask it, we provide.

You can define a `shallowCollections` key in your `.drosserc.js` file. It must contain an array with collection names. All the collections listed in this array will be recreated from the JSON files in the `collections` directory on each Drosse startup.

## Identify your documents
One more thing. To make Drosse aware of how you identify each of your document, you should provide in each document a `DROSSE` property which contains an `ids` property, which itself contains a list of what you consider the document identifiers.

It can be very useful to have different identifiers for your documents. As the identifiers don't have to be unique, it's not an issue. Don't forget that Drosse is a mock server. You aim to mock a real system that lives somewhere out there. And in the real world, it happens often that the same entity is retrieved through different ways. Imagine a Project entity. It could be retrieved by its unique ID, but maybe also by a customer unique code or whatever else.

The real backend has probably different methods to fetch the project accordingly. But here we want to be fast and we don't care about all that. So we can store all the potential identifiers of a document in our `DROSSE.ids` array. It will look like this:

```json
{
  "id": 1980,
  "name": "Construction of a skyscraper",
  "customer": {
    "id": 888,
    "name": "ACME corp",
    "projectCode": "SKYSCRAPER-999"
  },
  "budget": 98000000,
  "DROSSE": {
    "ids": [1980, "SKYSCRAPER-999"]
  }
}
```
Like this, it will be easier to find our document and we won't have to ask ourselves which identifier was sent to our service.


## Reference documents
In the above example we have a customer inside a project. But what if we want to list all the customers in our app ? We could duplicate the customer informations into a `customers` collection, but that would mean that the customer's informations displayed in the project document are duplicated. Not good to maintain our mocks...

Here come reference documents to the rescue!

Assuming you have a `customers` collection with this customer document in it.

```json
{
  "id": 888,
  "name": "ACME corp",
  "address": {
    "street": "Undefined or null 1",
    "zip": "00001",
    "town": "North Pole City"
  },
  "activity": "Secretely conquer the world by not being evil... at first.",
  "DROSSE": {
    "ids": [888]
  }
}
```

You can redefine your project like this:

```json
{
  "id": 1980,
  "name": "Construction of a skyscraper",
  "customer": {
    "collection": "customers",
    "id": 888,
    "projectCode": "SKYSCRAPER-999"
  },
  "budget": 98000000,
  "DROSSE": {
    "ids": [1980, "SKYSCRAPER-999"]
  }
}
```

The company name is not duplicated anymore.

When you've fetched the project document, you can easily query the linked customer by calling the [`db.get.byRef()`](#byref) method and pass it the `project.customer` object. Drosse will automatically understand the pattern "collection - id" and return the corresponding customer document. You can then overwrite `project.customer` with this result.


## API

Once your documents are stored in the database, here is how you can query them or even insert new documents programmatically. As you've maybe already read above in the [Dynamic mocks](dynamic-mocks.md) section, when you define a service function, it takes an object as argument and this object contains a `db` property. This `db` property exposes the whole Drosse DB API. Let's have a look to it in detail.

### list
#### all
`db.list.all(collection, cleanFields)`

List all documents in a collection.

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| cleanFields             | no         | Array     | A list of properties you want to exclude from each returned document |

Returns an _Array_ of documents.

#### byId
`db.list.byId(collection, id, cleanFields)`

List all documents in a collection that have the provided identifier.

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| id                      | yes        | Mixed     | A [document identifier](#identify-your-documents) |
| cleanFields             | no         | Array     | A list of properties you want to exclude from each returned document |

Returns an _Array_ of documents.

#### byFields
`db.list.byFields(collection, fields, value, cleanFields)`

List all documents in a collection having at least one of the provided fields that contains the provided value.

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| fields                  | yes        | String[]  | A list of fields                |
| value                   | yes        | Mixed     | A value to test for. Should be a string or number |
| cleanFields             | no         | Array     | A list of properties you want to exclude from each returned document |

Returns an _Array_ of documents.

#### byField
`b.list.byField(collection, field, value, cleanFields)`

List all documents in a collection having the provided field that contains the provided value.

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| field                   | yes        | String    | A field                         |
| value                   | yes        | Mixed     | A value to test for. Should be a string or number |
| cleanFields             | no         | Array     | A list of properties you want to exclude from each returned document |

Returns an _Array_ of documents.

#### find
`db.list.find(collection, query, cleanFields)`

List all documents in a collection matching the provided query.

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| query                   | yes        | Object    | A lokiJS query object           |
| cleanFields             | no         | Array     | A list of properties you want to exclude from each returned document |

Returns an _Array_ of documents.

#### where
`db.list.where(collection, searchFn, cleanFields)`

List all documents in a collection for which the searchFn callback returns a truthy value

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| searchFn                | yes        | Function  | A function that will be called for each document and take the document in argument. |
| cleanFields             | no         | Array     | A list of properties you want to exclude from each returned document |

Returns an _Array_ of documents.

### get
#### byId
`db.get.byId(collection, id, cleanFields)`

Find first document in a collection that have the provided identifier.

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| id                      | yes        | Mixed     | A [document identifier](#identify-your-documents) |
| cleanFields             | no         | Array     | A list of properties you want to exclude from each returned document |

Returns a document.

#### byFields
`db.get.byFields(collection, fields, value, cleanFields)`

Find first document in a collection having at least one of the provided fields that contains the provided value.

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| fields                  | yes        | String[]  | A list of fields                |
| value                   | yes        | Mixed     | A value to test for. Should be a string or number |
| cleanFields             | no         | Array     | A list of properties you want to exclude from each returned document |

Returns a document.

#### byField
`db.get.byField(collection, field, value, cleanFields)`

Find first document in a collection having the provided field that contains the provided value.

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| field                   | yes        | String    | A field                         |
| value                   | yes        | Mixed     | A value to test for. Should be a string or number |
| cleanFields             | no         | Array     | A list of properties you want to exclude from each returned document |

Returns a document.

#### find
`db.get.find(collection, query, cleanFields)`

Find first document in a collection matching the provided query.

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| query                   | yes        | Object    | A lokiJS query object           |
| cleanFields             | no         | Array     | A list of properties you want to exclude from each returned document |

Returns a document.

#### where
`db.get.where(collection, searchFn, cleanFields)`

Find first document in a collection for which the searchFn callback returns a truthy value

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| searchFn                | yes        | Function  | A function that will be called for each document and take the document in argument. |
| cleanFields             | no         | Array     | A list of properties you want to exclude from each returned document |

Returns a document.

#### byRef
`db.get.byRef(refObj, dynamicId, cleanFields)`

Find first document in a collection matching the provided query.

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| refObj                  | yes        | Object    | An object that contains a `collection` property and an `id` property. See [Reference documents](#reference-documents) |
| dynamicId               | no         | Mixed     | A [document identifier](#identify-your-documents) |
| cleanFields             | no         | Array     | A list of properties you want to exclude from each returned document |

Returns a document.

```js
const getDetailedProject = projectId => {
  const myProject = db.get.byId('projects', projectId)
  myProject.customer = db.get.byRef(myProject.customer)
  return myProject
}

const detailedProject = getDetailedProject(1980)
```

### query
#### getMapId
`db.query.getMapId(collection, fieldname, firstOnly)`

Generate a hash to link a specific document field value to the document ids (or first id)

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| fieldname               | yes        | String    | A field                         |
| firstOnly               | no         | Boolean   | If `true`, will consider only the first `id` found in the `DROSSE.ids` array. |

Returns a correspondance hash with the chosen field value as key and the corresponding id as value.

!!! warning
    Be aware that if the chosen `fieldname` hasn't unique values for each document in collection, the later documents will overwrite the formers.

#### chain
`db.query.chain(collection)`

Exposes the LokiJS chain method ([see LokiJS documentation](https://techfort.github.io/LokiJS/Collection.html) for more details)

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |

Returns a [LokiJS ResultSet](https://techfort.github.io/LokiJS/Resultset.html)

#### clean
`db.query.clean([...fields])`

Creates a cleaning function that will remove all listed fields from the passed object

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| ...fields               | no         | ...String | Any number of fieldnames        |

Returns a function that takes a javascript Object as unique argument

!!! note
    Even if no fields are passed, the function will be configured to remove the `reseserved words` from Drosse and Loki, aka: `$loki`, `meta` and `DROSSE`.

!!! info
    This function is used in all other methods to clean up the results and merges the optional `cleanFields` with the `reserved words`.

### insert
`db.insert(collection, ids, payload)`

Inserts a document in a collection

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| ids                     | yes        | Array     | An array of identifiers for your new document (will be stored in `DROSSE.ids`) |
| payload                 | yes        | Object    | The document                    |

Returns the inserted document

### update
#### byId
`db.update.byId(collection, id, newValue)`

Updates a document in a collection

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| id                      | yes        | Mixed     | One of the document identifiers (from `DROSSE.ids`) |
| newValue                | yes        | Object    | A hash with keys being of type `field.subfield.subsubfield` ([lodash.set](https://lodash.com/docs#set) is used to apply the changes) |

Returns _nothing_

#### subItem-append
`db.update.subItem.append(collection, id, subPath, payload)`

Insert (append) a new item in some of the identified document subItems list

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| id                      | yes        | Mixed     | One of the document identifiers (from `DROSSE.ids`) |
| subPath                 | yes        | String    | A string of type `field.subfield.subsubfield` pointing to the field to alter |
| payload                 | yes        | Object    | The sub item to insert          |

Returns _nothing_


#### subItem-prepend
`db.update.subItem.prepend(collection, id, subPath, payload)`

Insert (prepend) a new item in some of the identified document subItems list

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| id                      | yes        | Mixed     | One of the document identifiers (from `DROSSE.ids`) |
| subPath                 | yes        | String    | A string of type `field.subfield.subsubfield` pointing to the field to alter |
| payload                 | yes        | Object    | The sub item to insert          |

Returns _nothing_

#### byId
`db.remove.byId(collection, id)`

Removes (delete) a document from a collection

| Argument                | Required   | Type      | Description                     |
|-------------------------|------------|-----------|---------------------------------|
| collection              | yes        | String    | The collection name             |
| id                      | yes        | Mixed     | One of the document identifiers (from `DROSSE.ids`) |

Returns _nothing_ or `false` if the document was not found.