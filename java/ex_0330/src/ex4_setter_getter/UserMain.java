package ex4_setter_getter;

public class UserMain {
	public static void main(String[] args) {
		User u = new User();
		u.setuserName("홍길동");
		System.out.println(u.getuserName());
		u.setpassWord("123456");
		System.out.println(u.getpassWord());
		u.setemail("akak@");
		System.out.println(u.getemail());
		
	}
}
