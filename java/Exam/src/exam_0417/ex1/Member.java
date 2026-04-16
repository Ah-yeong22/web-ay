package exam_0417.ex1;

public class Member {

	private String id;
	private String name;
	private int age;
	
	public Member(String id,String name, int age) {
		this.age=age;
		this.id=id;
		this.name=name;
	}
	
	public void printInfo() {
		System.out.println("아이디:" + id + ",이름:" + name+ ",나이:" + age);
	}
	
	public int getAge() {
		return age;
	}
}
