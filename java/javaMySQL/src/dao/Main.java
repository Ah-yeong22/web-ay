package dao;

public class Main {
 
	public static void main(String[] args) {
		//member 테이블의 모든 내용 조회하기 
		MemberDAO dao = new MemberDAO();
		
		dao.findAll();
	}
}
