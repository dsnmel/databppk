const express = require("express");
const mysql = require("mysql");
const BodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs"); // Tambahkan ini
app.use(BodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true })); // Untuk parsing form data
app.use(express.json()); 

const db = mysql.createConnection({
    host: "localhost",
    database: "data_bppk",
    user: "root",
    password: "",
});

db.connect((err) => {
    if (err) throw err;
    console.log("Database connected");

    const sql = "SELECT * FROM pengawasankeuangan";
    db.query(sql, (err, result) => {
        if (err) throw err;

        const pengawasankeuangan = JSON.parse(JSON.stringify(result));

        // Route GET untuk menampilkan data menggunakan EJS
        app.get("/", (req, res) => {
            res.render("index"); // Kirim data ke file EJS
        });

        app.get("/arsip", (req, res) => {
            res.render("arsip");
        });

        app.get("/ecooffice", (req, res) => {
            res.render("ecooffice");
        });

        app.get("/bmn", (req, res) => {
            res.render("bmn");
        });

        app.get("/", (req, res) => {
            res.render("index");
        });

        app.use(express.static('public'));  // Menyajikan file statis dari folder 'public'

        app.get("/dataArsip", (req, res) => {
            const sqlPengawasan = "SELECT * FROM pengawasankeuangan"; // Query untuk tabel pengawasankeuangan
            const sqlFgd = "SELECT * FROM fgdKearsipan"; // Query untuk tabel fgdKearsipan
            const sqlKickOff = "SELECT * FROM kickoffpengawasan"; // Query untuk tabel kickoffpengawasan
            const sqlPemusnahan = "SELECT * FROM pemusnahanarsip"; // Query untuk tabel pemusnahanarsip

            db.query(sqlPengawasan, (err, resultPengawasan) => {
                if (err) throw err;
                const dataKearsipan = JSON.parse(JSON.stringify(resultPengawasan));

                db.query(sqlFgd, (err, resultFgd) => {
                    if (err) throw err;
                    const dataFgd = JSON.parse(JSON.stringify(resultFgd));

                    db.query(sqlKickOff, (err, resultKickOff) => {
                        if (err) throw err;
                        const datakickOff = JSON.parse(JSON.stringify(resultKickOff));

                        db.query(sqlPemusnahan, (err, resultPemusnahan) => {  // Perbaikan di sini
                            if (err) throw err;
                            const dataPemusnahan = JSON.parse(JSON.stringify(resultPemusnahan));

                            // Kirimkan data dari semua tabel ke template
                            res.render("dataArsip", { dataKearsipan, dataFgd, datakickOff, dataPemusnahan });
                        });
                    });
                });
            });
        });

        app.get("/dataeco", (req, res) => {
            const sqlecooffice = "SELECT * FROM ecooffice";

            db.query(sqlecooffice, (err, resultecooffice) => {
                if (err) throw err;
                const dataecooffice = JSON.parse(JSON.stringify(resultecooffice));

                res.render("dataeco", { dataecooffice });
            });
        })

        app.get("/databmn", (req, res) => {
            const sqlpenjualan = "SELECT * FROM pemindahtanganan_penjualan";

            db.query(sqlpenjualan, (err, resultpenjualan) => {
                if (err) throw err;
                const datapenjualan = JSON.parse(JSON.stringify(resultpenjualan));

                res.render("databmn", { datapenjualan });
            });
        })

        // Route POST untuk menambahkan data
        app.post("/tambah", (req, res) => {
            // Pastikan body parser aktif
            const {
                jenis_data, unit, kedudukan, nilaiPengawasan, tanggal,
                detail_kegiatan, tanggal1, jenisdata,
                jenisData2, detail_acara, tanggal2,
                jenisdata1, kurunWaktu, jumlah, tanggal3, dokumentasi, totalPNPB
            } = req.body;

            console.log("Data diterima:", req.body); // Debugging

            const insertSql1 = `INSERT INTO pengawasankeuangan (jenis_data, unit, kedudukan, nilaiPengawasan, tanggal) VALUES (?, ?, ?, ?, ?)`;
            const insertSql2 = `INSERT INTO fgdKearsipan (detail_kegiatan, tanggal1, jenisdata) VALUES (?, ?, ?)`;
            const insertSql3 = `INSERT INTO kickoffpengawasan (jenisData2, detail_acara, tanggal2) VALUES (?, ?, ?)`;
            const insertSql4 = `INSERT INTO pemusnahanarsip (jenisdata1, unit, kurunWaktu, jumlah, tanggal3, dokumentasi, totalPNPB) VALUES (?, ?, ?, ?, ?, ?, ?)`;

            // Tentukan query yang akan dijalankan berdasarkan jenis data
            let query, values;
            if (jenis_data) {
                query = insertSql1;
                values = [jenis_data, unit, kedudukan, nilaiPengawasan, tanggal];
            } else if (jenisdata) {
                query = insertSql2;
                values = [detail_kegiatan, tanggal1, jenisdata];
            } else if (jenisData2) {
                query = insertSql3;
                values = [jenisData2, detail_acara, tanggal2];
            } else if (jenisdata1) {
                query = insertSql4;
                values = [jenisdata1, unit, kurunWaktu, jumlah, tanggal3, dokumentasi, totalPNPB];
            } else {
                return res.status(400).send("Jenis data tidak ditemukan!");
            }

            // Eksekusi query
            db.query(query, values, (err, result) => {
                if (err) {
                    console.error("Error saat menambahkan data:", err);
                    return res.status(500).send("Gagal menambahkan data ke database");
                }
            });

            res.render("arsip");
        });

        app.post("/tambah1", (req, res) => {
            const { ket_data, progres, tanggal4 } = req.body;

            // Debugging
            console.log("Data diterima:", req.body);

            const insertSql5 = `INSERT INTO ecooffice (ket_data, progres, tanggal4) VALUES (?, ?, ?)`;

            db.query(insertSql5, [ket_data, progres, tanggal4], (err, result) => {
                if (err) {
                    console.error("Error saat menambahkan data ke ecooffice:", err);
                    return res.status(500).send("Gagal menambahkan data ke ecooffice");
                }

                console.log("Data berhasil dimasukkan ke database:", result);
                res.redirect("/ecooffice"); // Redirect ke halaman setelah submit
            });
        });

        app.get ("/grafikeco", (req, res) => {
            const sql5 = "SELECT ket_data AS ket_data, COUNT(*) AS count FROM ecooffice GROUP BY ket_data";
            db.query(sql5, (err, result5) => {
                if (err) return res.status(500).send("Terjadi kesalahan pada ecooffice!");
                console.log("Data Eco Office:", result5);
                res.render("grafikeco", {
                    dataecooffice: result5,
                });
            });
        });

        app.get ("/grafikbmn", (req, res) => {
            const sql6 = "SELECT jen_data AS jen_data, COUNT(*) AS count FROM pemindahtanganan_penjualan GROUP BY jen_data";
            db.query(sql6, (err, result6) => {
                if (err) return res.status(500).send("Terjadi kesalahan pada ecooffice!");
                console.log("Data Eco Office:", result6);
                res.render("grafikbmn", {
                    datapenjualan: result6,
                });
            });
        });

        app.post("/tambah2", (req, res) => {
            // Pastikan body parser aktif
            const {
                unitkerja, namaBarang, jumlah, nilaiPNPB, serahTerima, jumlahPNPB, tanggal2, jen_data,
                unitLelang, barang, jumlahLelang, tindaklanjut, totalJumlah, tanggal3, jenis_data1,
                unitHibah, barangHibah, jumlahHibah, progresHibah, tindaklanjut1, totalJumlah1, tanggal4, jen_data2,
                jenisPengadaan, nilaiBMN, tanggal5, jen_data3,
                unitProses, barangProses, jumlahProses, progresProses, tindaklanjut2, totalJumlah2, tanggal6, jen_data4
            } = req.body;

            console.log("Data diterima:", req.body); // Debugging

            const insertSql6 = `INSERT INTO pemindahtanganan_penjualan (unitkerja, namaBarang, jumlah, nilaiPNPB, serahTerima, jumlahPNPB, tanggal2, jen_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const insertSql7 = `INSERT INTO proseslelang (unitLelang, barang, jumlahLelang, tindaklanjut, totalJumlah, tanggal3, jenis_data1) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const insertSql8 = `INSERT INTO hibah (unitHibah, barangHibah, jumlahHibah, progresHibah, tindaklanjut1, totalJumlah1, tanggal4, jen_data2) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const insertSql9 = `INSERT INTO pengadaanBMN (jenisPengadaan, nilaiBMN, tanggal5, jen_data3) VALUES (?, ?, ?, ?)`;
            const insertSql10 = `INSERT INTO dlmproses(unitProses, barangProses, jumlahProses, progresProses, tindaklanjut2, totalJumlah2, tanggal6, jen_data4) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            // Tentukan query yang akan dijalankan berdasarkan jenis data
            let query, values;
            if (jen_data) {
                query = insertSql6;
                values = [unitkerja, namaBarang, jumlah, nilaiPNPB, serahTerima, jumlahPNPB, tanggal2, jen_data];
            } else if (jenis_data1) {
                query = insertSql7;
                values = [unitLelang, barang, jumlahLelang, tindaklanjut, totalJumlah, tanggal3, jenis_data1];
            } else if (jen_data2) {
                query = insertSql8;
                values = [unitHibah, barangHibah, jumlahHibah, progresHibah, tindaklanjut1, totalJumlah1, tanggal4, jen_data2];
            } else if (jen_data3) {
                query = insertSql9;
                values = [jenisPengadaan, nilaiBMN, tanggal5, jen_data3];
            }else if (jen_data4) {
                query = insertSql10;
                values = [unitProses, barangProses, jumlahProses, progresProses, tindaklanjut2, totalJumlah2, tanggal6, jen_data4];
            } else {
                return res.status(400).send("Jenis data tidak ditemukan!");
            }

            // Eksekusi query
            db.query(query, values, (err, result) => {
                if (err) {
                    console.error("Error saat menambahkan data:", err);
                    return res.status(500).send("Gagal menambahkan data ke database");
                }
            });

            res.render("bmn");
        });


        app.get("/grafik", (req, res) => {
            const sql1 = "SELECT jenis_data AS jenis_data, COUNT(*) AS count FROM pengawasankeuangan GROUP BY jenis_data";
            const sql2 = "SELECT jenisdata AS jenis_data, COUNT(*) AS count FROM fgdkearsipan GROUP BY jenisdata";
            const sql3 = "SELECT jenisData2 AS jenis_data, COUNT(*) AS count FROM kickoffpengawasan GROUP BY jenisData2";
            const sql4 = "SELECT jenisdata1 AS jenis_data, COUNT(*) AS count FROM pemusnahanarsip GROUP BY jenisdata1";

            db.query(sql1, (err, result1) => {
                if (err) return res.status(500).send("Terjadi kesalahan pada pengawasankeuangan!");

                db.query(sql2, (err, result2) => {
                    if (err) return res.status(500).send("Terjadi kesalahan pada fgdkearsipan!");

                    db.query(sql3, (err, result3) => {
                        if (err) return res.status(500).send("Terjadi kesalahan pada kickoffpengawasan!");

                        db.query(sql4, (err, result4) => {
                            if (err) return res.status(500).send("Terjadi kesalahan pada pemusnahanarsip!");

                            console.log("Data Keuangan:", result1);
                            console.log("Data Arsip:", result2);
                            console.log("Data Pengawasan:", result3);
                            console.log("Data Pemusnahan:", result4);

                            res.render("grafikArsip", {
                                dataKeuangan: result1,
                                dataArsip: result2,
                                dataPengawasan: result3,
                                dataPemusnahan: result4
                            });
                        });
                    });
                });
            });
        });
    });
});

app.listen(8000, () => {
    console.log("Server ready");
});
