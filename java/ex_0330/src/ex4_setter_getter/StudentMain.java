package ex4_setter_getter;

public class StudentMain {
	public static void main(String[] args) {
	
		Student s = new Student();
		s.setName("홍기리기리");
		System.out.println(s.getName());
		s.setage(-1);
		System.out.println(s.getage());
}
}
