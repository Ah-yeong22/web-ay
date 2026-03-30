package ex5_singleton;

public class SingletonExample {
	public static void main(String[] args) {
		//생성자가 private으로 정의되어 있기 때문에 Singleton 호출 불가능
		
		//Singleton클래스에서 만들어놨던 객체를 받아온 것 
		 Singleton obj1 = Singleton.getInstance();
		 Singleton obj2 = Singleton.getInstance();
		 
		 System.out.println(obj1);
		 System.out.println(obj2);
		 
		 
		 AttendanceManager a1 = AttendanceManager.getInstance();
		 AttendanceManager a2 = AttendanceManager.getInstance();
		 
		 a1.addAttendance();
		 a2.addAttendance();
		 
		 System.out.println(a1.getAttendanc());
		 System.out.println(a2.getAttendanc());
		 
		 //싱글톤 패턴을 사용하는 이유
		 //공유 자원을 효율적으로 관리하고, 구조를 안정적으로 유지하기 위해
		 //new.생성자(); 를 통해서 객체를 여러개 만들게 되면 메모리를 많이 사용함
		 //어디서든지 같은 객체를 가져올 수 있다. 
		 //데이터를 일관성있게 유지할 수 있다.
	}
}
