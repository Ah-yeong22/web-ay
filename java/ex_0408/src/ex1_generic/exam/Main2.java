package ex1_generic.exam;

public class Main2 {
	public static void main(String[] args) {
		
		MemberResponse<Member> m3 = new MemberResponse<Member>
		(true, "테스트", new Member("홍길동",30));
		System.out.println(m3.isSuccess());
		System.out.println(m3.getMessage());
		System.out.println(m3.getDate().getName());
		System.out.println(m3.getDate().getAge());
		
		
		
	}
	
	
}
