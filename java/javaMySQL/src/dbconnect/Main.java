package dbconnect;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class Main {

	public static void main(String[] args) {
		
		//db 접속 경로
		//형식 
		//jdbc:mysql://서버주소:포트번호/데이터베이스명
		String url = "jdbc:mysql://localhost:3306/java_db";
		String user = "root";
		String password = "11111111";
		Connection conn = null;
		
		String sql = "INSERT INTO member(name, email,age) values(?,?,?)";
		try {
			conn = DriverManager.getConnection(url, user, password);
			System.out.println("연결 성공");
			
			//select,insert,update,delete
			//실행할 sql을 작성 
			//?는 값이 들어갈 자리 (placeholder)
			
			//SQL을 안전하고 효율적으로 실행하기 위한 객체 
			PreparedStatement pstmt = conn.prepareStatement(sql);
			
			pstmt.setString(1, "이영희");
			pstmt.setString(2, "yonghee@test.com");
			pstmt.setInt(3, 25);
			
			//sql 실행
			//executeUpdate(): inset,update,delete시에 사용
			pstmt.executeUpdate();
			
			System.out.println("추가 성공");
		} catch (Exception e) {
			System.out.println("연결 실패");
			e.printStackTrace();
		} finally {
			try {
				if(conn != null) {
					conn.close();
				}
			} catch (Exception e2) {
				
			}
		}
	}
}

