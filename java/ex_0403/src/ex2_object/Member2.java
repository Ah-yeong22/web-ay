package ex2_object;

public class Member2 {

	String id;
	String name;
	
	public Member2(String id, String name) {
		this.id=id;
		this.name=name;
	}
	@Override
	public boolean equals(Object obj) {
		if(obj instanceof Member target) {
			if(id.equals(target.id)) { //id 문자열이 같은지 비교
				return true;
			}
		}
			
			
		return super.equals(obj);
	}
}
