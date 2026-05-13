package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import common.DBUtil;
import dto.MemberDTO;

//DAO(Data Access Object)
//실제로 DB에 접근하는 클래스 
public class MemberDAO {

	List<MemberDTO> list = new ArrayList<>();
	//조회
	public void findAll() {
		//member테이블에서 데이터를 조회한 후 memberDTO 객체에 담은 후 
		//콘솔에 출력하는 코드 작성하기 
		
		String sql = "select * from member";
		
		try(
			Connection conn = DBUtil.getConnection();
				
			PreparedStatement pstmt = conn.prepareStatement(sql);
				
			ResultSet rs = pstmt.executeQuery();
				) {
			
			while(rs.next()) {
				int id = rs.getInt("id");
				String name = rs.getString("name");
				String eamil = rs.getString("eamil");
				int age = rs.getInt("age");
				
				list.add(new MemberDTO(id,name,eamil,age));
				
			}
			
			list.forEach(x -> {
				System.out.println("ID : " + x.getId());
				System.out.println("이름 : " + x.getName());
				System.out.println("이메일 : " + x.getEmail());
				System.out.println("나이 : " + x.getAge());
				System.out.println("-------------------");
			});
			
		} catch (Exception e) {
			// TODO: handle exception
		}
	}
	//추가
	public void insertMember(MemberDTO dto) {
		
	}
	//수정
	//특정 사람의 나이를 수정하는 메서드 작성하기 
	public void updateMember() {
		
	}
	//삭제
}
