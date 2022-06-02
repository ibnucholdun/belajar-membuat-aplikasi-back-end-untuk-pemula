const {
  nanoid,
} = require('nanoid');
const books = require('./books');

// handler menambahkan buku
const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);

  // check apakah buku telah selesai dibaca atau belum
  const finished = (pageCount === readPage);

  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  // Client tidak melampirkan properti name pada request body
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  books.push(newBook);
  const inSuccess = books.filter((book) => book.id === id).length > 0;

  // buku berhasil dimasukkan
  if (inSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  // Server gagal memasukkan buku karena alasan umum (generic error)
  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

// mendapatkan seluruh semua buku
const getAllBookHandler = (request, h) => {
  const {
    name,
    reading,
    finished,
  } = request.query;

  let filteredBooks = books;

  // filter dengan query parameter name
  if (name !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        books: filteredBooks = filteredBooks
          .filter((book) => book.name.toLowerCase().includes(name.toLowerCase()))
          .map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
      },
    });
    response.code(200);
    return response;
  }

  // filter dengan query parameter reading
  if (reading !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        books: filteredBooks = filteredBooks.filter((book) => book.reading === (reading === '1'))
          .map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
      },
    });
    response.code(200);
    return response;
  }

  // filter dengan query parameter finished
  if (finished !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        books: filteredBooks = filteredBooks.filter((book) => book.finished === (finished === '1'))
          .map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
      },
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'success',
    data: {
      books: books.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);
  return response;
};

// menampilkan detail buku berdasarkan id
const getBookByIdHandler = (request, h) => {
  const {
    bookId,
  } = request.params;

  const book = books.filter((b) => b.id === bookId)[0];

  if (book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

// mengedit isi buku berdasarkan id
const editBookByIdHandler = (request, h) => {
  const {
    bookId,
  } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const finished = (pageCount === readPage);
  const updatedAt = new Date().toISOString();

  // Client tidak melampirkan name pada request body
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // Client melampirkan nilai readPage yang lebih besar dari pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const index = books.findIndex((b) => b.id === bookId);
  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  // Id yang dilampirkan oleh client tidak ditemukkan oleh server.
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

// menghapus buku berdasarkan id
const deleteBookByIdHandler = (request, h) => {
  const {
    bookId,
  } = request.params;

  const index = books.findIndex((b) => b.id === bookId);
  if (index !== -1) {
    books.splice(index, 1);

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  // Id yang dilampirkan oleh client tidak ditemukkan oleh server.
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBookHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
