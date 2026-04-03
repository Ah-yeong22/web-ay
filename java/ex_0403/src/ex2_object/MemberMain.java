package ex2_object;

public class MemberMain {

	public static void main(String[] args) {
		Member2 m1 = new Member2("123", "홍길동");
		Member2 m2 = new Member2("156", "박길동");
		Member2 m3 = new Member2("853", "김길동");
		
		if(m1.equals(m2)) {
			System.out.println("1,2는 동일함 ");
		}else {
			System.out.println("다름");
		}
		if(m1.equals(m3)) {
			System.out.println("1,3는 동일함 ");
		}else {
			System.out.println("다름");
		}
		
	}
}
