package ex2_object;

public class HashcodeExample {

	public static void main(String[] args) {
		Student s1 = new Student(1,"홍길동");
		Student s2 = new Student(1,"홍길동");
		
		//해시코드가 같은지 검사 
		System.out.println(s1.hashCode() == s2.hashCode());
	}
}
