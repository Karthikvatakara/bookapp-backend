import { Client } from "@elastic/elasticsearch";
import { IBook } from "../interfaces/IBook";
import dotenv from "dotenv";
dotenv.config()

class ElasticsearchService {
    private client : Client;

    constructor() {
        if (!process.env.ELASTIC_CLOUD_ID || !process.env.ELASTIC_USERNAME || !process.env.ELASTIC_PASSWORD) {
            throw new Error('Missing Elasticsearch configuration');
        }

        this.client = new Client({
            cloud: {
                id: process.env.ELASTIC_CLOUD_ID!
            },
            auth: {
                username: process.env.ELASTIC_USERNAME!,
                password: process.env.ELASTIC_PASSWORD!
            }
        })
    }


    async initIndex(): Promise<void> {
        try {
            const indexExists = await this.client.indices.exists({
                index: 'books'
            });

            if (!indexExists) {
                await this.client.indices.create({
                    index: 'books',
                    body: {
                        mappings: {
                            properties: {
                                title: { type: 'text' },
                                author: { type: 'text' },
                                description: { type: 'text' },
                                isbn: { type: 'keyword' },
                                publicationYear: { type: 'integer' }
                            }
                        }
                    }
                });
                console.log('Elasticsearch index created successfully');
            }
        } catch (error) {
            console.error('Error initializing Elasticsearch index:', error);
            throw error;
        }
    }


    async getAllBooks(): Promise<IBook[]> {
        try {
            const result = await this.client.search({
                index: 'books',
                body: {
                    query: {
                        match_all: {}
                    }
                },
                size: 100
            });

            return result.hits.hits.map((hit: any) => ({
                ...hit._source,
                score: hit._score
            }));
        } catch (error) {
            console.error('Elasticsearch error:', error);
            throw new Error(`Elasticsearch getAllBooks failed: ${(error as Error)?.message}`);
        }
    }


    async searchBooks(query: string): Promise<IBook[]> {
        try {
            const searchQuery = {
                index: 'books',
                query: {
                    bool: {
                        should: [
                            {
                                multi_match: {
                                    query,
                                    fields: ['title^3', 'author^2', 'description'],
                                    fuzziness: 'AUTO',
                                    operator: 'OR', 
                                    type: 'best_fields',
                                    minimum_should_match: '70%'
                                }
                            },
                            {
                                match_phrase_prefix: {
                                    title: {
                                        query,
                                        boost: 4
                                    }
                                }
                            }
                        ]
                    }
                },
                highlight: {
                    fields: {
                        title: {},
                        author: {},
                        description: {}
                    }
                },
                size: 100,
                sort: [
                    { _score: { order: 'desc' } }
                ]
            };
    
            const result = await this.client.search(searchQuery);
    
            return result.hits.hits.map((hit: any) => ({
                ...hit._source,
                score: hit._score,
                highlights: hit.highlight
            }));
        } catch (error) {
            console.error('Elasticsearch error:', error);
            throw new Error(`Elasticsearch search failed: ${(error as Error)?.message}`);
        }
    }

    // async getBooks(query?: string) : Promise<IBook[]>  {
    //     try{
    //         let body: any = {
    //             query: {
    //                 match_all : {}
    //             }
    //         };

    //         if(query) {
    //             body = {
    //                 query: {
    //                     multi_match : {
    //                         query,
    //                         fields: ['title','author','description']
    //                     }
    //                 }
    //             }
    //         }
    //         const result = await this.client.search({
    //             index: 'books',
    //             body
    //         });

    //         return result.hits.hits.map((hit) => hit._source as IBook)
    //     }catch(error){
    //         console.error('error occured ',error);
    //         throw new Error((error as Error)?.message)
    //     }
    // }

    // async getBooks(query?: string): Promise<IBook[]> {
    //     try {
    //         let body: any = {
    //             query: {
    //                 match_all: {}
    //             }
    //         };
    
    //         if (query) {
    //             body = {
    //                 query: {
    //                     multi_match: {
    //                         query,
    //                         fields: ['title', 'author', 'description'],
    //                         // Add these parameters for better matching
    //                         fuzziness: 'AUTO',
    //                         operator: 'or',
    //                         type: 'best_fields'
    //                     }
    //                 }
    //             };
    //         }
    
    //         console.log('Elasticsearch query:', JSON.stringify(body, null, 2));
    
    //         const result = await this.client.search({
    //             index: 'books',
    //             body,
    //             size: 100 // Add a size parameter to ensure you get enough results
    //         });
    
    //         console.log('Elasticsearch response hits:', result.hits.total);
    
    //         const books = result.hits.hits.map((hit: any) => ({
    //             ...hit._source,
    //             score: hit._score // Optionally include the relevance score
    //         }));
    
    //         return books;
    //     } catch (error) {
    //         console.error('Elasticsearch error:', error);
    //         // Log the specific Elasticsearch error details
          
    //         throw new Error(`Elasticsearch search failed: ${(error as Error)?.message}`);
    //     }
    // }


    async indexBook(book: IBook ) {
        try{
            const response =  await this.client.index({
                index: 'books',
                id: book._id.toString(),
                document: {
                    id: book._id,
                    title: book.title,
                    author: book.author,
                    description: book.description,
                    isbn: book.isbn,
                    thumbnail: book.thumbnail,
                    publicationYear: book.publicationYear
                  },
                refresh: true
            });
            console.log("🚀 ~ ElasticsearchService ~ indexBook ~ response:", response)
            return response;
        }catch(error){
            console.error('elasticsearch indexing error ',error)
            throw new Error((error as Error)?.message)
        }
    }

    async updateBook(bookId: string,  book: IBook) {
        try{
            return await this.client.update({
                index: 'books',
                id: bookId,
                doc: {
                    title: book.title,
                    author: book.author,
                    description: book.description,
                    isbn: book.isbn,
                    publicationYear: book.publicationYear
                  }
            })
        }catch(error){
            console.error('elasticsearch update error',error);
            throw new Error((error as Error)?.message);
        }
    }

    async deleteBook(bookId: string) {
        try{
            const result = await this.client.delete({
                index: 'books',
                id: bookId
            });
        }catch(error){
            console.error('elasticsearch delete error',error);
            throw new Error((error as Error)?.message)
        }
    }

    async getBookById(bookId: string): Promise<IBook | null> {
        try {
            const result = await this.client.search({
                index: 'books',
                body: {
                    query: {
                        term: {
                            _id: bookId
                        }
                    }
                }
            });

            if (result.hits.hits.length === 0) {
                return null;
            }

            const book = result.hits.hits[0]._source as IBook;
        return book;
        } catch (error) {
            console.error('Error retrieving book from Elasticsearch:', error);
            if ((error as any).meta.statusCode === 404) {
                return null; // Document not found
            }
            throw error;
        }
    }

}



export const elasticsearchService = new ElasticsearchService()