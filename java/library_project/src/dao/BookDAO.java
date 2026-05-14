package dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import dto.BookDTO;

public class BookDAO {

	String url =
			"jdbc:mysql://localhost:3306/rental_db";

	String user = "root";

	String password = "11111111";

	// 도서 등록
	public void insertBook(BookDTO dto) {

		Connection conn = null;
		PreparedStatement pstmt = null;

		String sql =
			"INSERT INTO book(title, author, stock) VALUES(?, ?, ?)";

		try {

			Class.forName("com.mysql.cj.jdbc.Driver");

			conn = DriverManager.getConnection(
					url, user, password);

			pstmt = conn.prepareStatement(sql);

			pstmt.setString(1, dto.getTitle());
			pstmt.setString(2, dto.getAuthor());
			pstmt.setInt(3, dto.getStock());

			int result = pstmt.executeUpdate();

			if(result > 0) {
				System.out.println("도서 등록 완료");
			}

		} catch (Exception e) {

			e.printStackTrace();

		} finally {

			try {

				if(pstmt != null)
					pstmt.close();

				if(conn != null)
					conn.close();

			} catch (Exception e2) {

			}
		}
	}

	// 전체 도서 조회
	public void findAllBooks() {

		String sql = "SELECT * FROM book";

		try (

			Connection conn =
				DriverManager.getConnection(
						url, user, password);

			PreparedStatement pstmt =
				conn.prepareStatement(sql);

			ResultSet rs = pstmt.executeQuery();

		) {

			while(rs.next()) {

				System.out.println("도서번호 : "
						+ rs.getInt("book_id"));

				System.out.println("제목 : "
						+ rs.getString("title"));

				System.out.println("저자 : "
						+ rs.getString("author"));

				System.out.println("재고 : "
						+ rs.getInt("stock"));

				System.out.println("----------------");
			}

		} catch (Exception e) {

			e.printStackTrace();
		}
	}
}