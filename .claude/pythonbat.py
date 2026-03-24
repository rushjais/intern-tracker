def sleep_in(weekday, vacation):
  if not weekday or vacation:
    return True
  else:
    return False
def monkey_trouble(a_smile, b_smile):
  return a_smile==b_smile
def sum_double(a, b):
  if a==b:
    return (a+b)*2
  else:
    return a+b

def diff21(n):
  if n>21:
    return (n-21)*2
  else:
    return abs(21-n)
def parrot_trouble(talking, hour):
  return talking and (hour<7 or hour>20)
def hello_name(name):
  return ("Hello "+name+"!")
def make_abba(a, b):
  return a+b*2+a
def make_tags(tag, word):
  return "<"+tag+">"+word+"</"+tag+">"
def make_out_word(out, word):
  mid = len(out)/2
  return out[:mid]+word+out[mid:]
def extra_end(str):
  return (str[-2:])*3
def first_two(str):
  if len(str)<2:
    return str
  else:
    return str[:2]
def first_last6(nums):
  if nums[0]==6 or nums[-1]==6:
    return True
  else:
    return False
def same_first_last(nums):
  if len(nums)>=1 and nums[0]==nums[-1]:
    return True
  else:
    return False
def make_pi():
  return [3,1,4]
def common_end(a, b):
  if a[0]==b[0] or a[-1]==b[-1]:
    return True
  else:
    return False
def sum3(nums):
  sum=0
  for num in nums:
    sum+=num
  return sum
def rotate_left3(nums):
  return nums[1:]+nums[:1]
def cigar_party(cigars, is_weekend):
  if is_weekend:
    return cigars>=40
  else:
    return cigars>=40 and cigars<=60
def date_fashion(you, date):
  if you <=2 or date <=2:
    return 0
  elif you >=8 or date>=8:
    return 2
  else:
    return 1
def squirrel_play(temp, is_summer):
  if is_summer and temp>=60 and temp<=100:
    return True
  elif temp>=60 and temp <=90:
    return True
  else:
    return False
def makes10(a, b):
  if a==10 or b==10 or a+b == 10:
    return True
  else:
    return False
def near_hundred(n):
  if abs(n-100)<=10 or abs(n-200)<=10:
    return True
  else:
    return False
def pos_neg(a, b, negative):
  if negative and (a<0 and b<0):
    return True
  elif (not negative) and( (a>0 and b<0) or (a<0 and b>0)):
      return True
  else:
      return False
def first_half(str):
  mid = len(str)/2
  return str[:mid]
def without_end(str):
  return str[1:len(str)-1]

