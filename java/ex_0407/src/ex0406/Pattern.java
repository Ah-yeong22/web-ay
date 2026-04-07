package ex0406;
public class Pattern {

	public static void main(String[] args) {
		String[] arr = {"123","abc","4567","a1b2"};
		
		String regExp="[0-9]+";
		for(String s : arr) {
			if(s.matches(regExp)) {
				System.out.println(s);
			}
		}
		
		String[] arr2 = {"홍길동","Tom","김철수","a1","김이박길동"};
		
		String regExp2="[가-힣]{2,5}";
		for(String s2 :  arr2) {
			if(s2.matches(regExp2)) {
				System.out.println(s2);
			}
		}
	}
}

